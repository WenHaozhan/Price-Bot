from scrapy.crawler import CrawlerProcess
from scrapy.crawler import CrawlerRunner
from twisted.internet import reactor
from twisted.internet.task import LoopingCall
import time
import psycopg2
import psycopg2.extras
from urllib.parse import urlparse
import re
from spiders.myspider import MySpider
from spiders.amazonspider import AmazonSpider
from spiders.neweggspider import NeweggSpider
from spiders.canadacomputerspider import CanadaComputerSpider
from scrapy.settings import Settings

conn = psycopg2.connect(dbname = "pricebotdb", user = "postgres", host = "localhost", password="ENTER PASSWORD HERE")


runner = CrawlerRunner(Settings(
    {
        # 'SPIDER_MIDDLEWARES' : {
        #     "middlewares.PythonwebscraperSpiderMiddleware": 543,
        # },
        'ITEM_PIPELINES' : {
            "pipelines.PythonwebscraperPipeline": 100,
        }
    }
))

TABLE = "notification_queue"
AMOUNT = 1
def searchDatabase(cur):
    try:
        cur.execute("""DELETE FROM {}
	        WHERE id IN (
		        SELECT id FROM {}
		            ORDER BY time
		            LIMIT {}
	        )  RETURNING *;""".format(TABLE, TABLE, AMOUNT))
        conn.commit()
    except Exception as e:
        print(e)


def getJobs():
    print("Executed")
    try:
        cur = conn.cursor(cursor_factory = psycopg2.extras.DictCursor)
    except Exception as e:
        raise e
    searchDatabase(cur)
    for row in cur:
        print (row)
        website = row['url'] #change to constant
        price = row['price'] #change to constant
        userid = row['userid']
        channelid = row['channelid']
        notifid = row['id']
        url = urlparse(website)
        if re.match("(www.)?amazon.(ca|com)", url.hostname):
            runner.crawl(AmazonSpider, website, price = price, channelid = channelid, userid = userid, notifid = notifid)
        elif re.match("(www.)?newegg.(ca|com)", url.hostname):
            runner.crawl(NeweggSpider, website, price = price, channelid = channelid, userid = userid, notifid = notifid)
        elif re.match("(www.)?canadacomputers.com", url.hostname):
            runner.crawl(CanadaComputerSpider, website, price = price, channelid = channelid, userid = userid, notifid = notifid)
    cur.close()
        
        
#cur.close()
#conn.close()

def onShutdown():
    print("end")
    conn.close()

POLL_INTERVAL = 30
try:    
    task = LoopingCall(getJobs)
    d = task.start(POLL_INTERVAL)
    d.addCallback(lambda e: print("CallBack"))
    d.addErrback(lambda e: print("Error Back"))
    reactor.addSystemEventTrigger('during', 'shutdown', onShutdown)
    reactor.run()
except Exception as e:
    print(str(e))




