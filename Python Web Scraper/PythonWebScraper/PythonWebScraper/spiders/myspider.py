import scrapy
import logging
from scrapy.crawler import CrawlerProcess
from scrapy.crawler import CrawlerRunner
# from twisted.internet.task import LoopingCall
# from twisted.internet import reactor


logging.getLogger().setLevel(logging.CRITICAL)
logging.getLogger('scrapy').propagate = False
class MySpider(scrapy.Spider):
    name = 'myspider'
    
#     def start_requests(self):
#         self.logger.setLevel(logging.CRITICAL)
#         urls = [
            
#         ]
#         headers = {
#             'user-agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36'
#         }
#         for url in urls:
#             yield scrapy.Request(url=url, headers=headers, callback=self.parse)
#     def parse(self, response):
#         print(response.xpath("//*[@id='corePrice_feature_div']//span[@class='a-offscreen']/text()").get())
    def __init__(self, start_url = None, price = None, id = None, **kwargs):
        super().__init__(**kwargs)
        self.start_urls.append(start_url)
        self.price = price
        self.id = id

def start_requests(self):
    headers = {
        'user-agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36'
    }
    for url in self.start_urls:
        yield scrapy.Request(url=url, headers=headers, callback=self.parse)



# process = CrawlerProcess(
#     settings={
#         "FEEDS": {
#             "items.json": {"format": "json"},
#         },
#     }
# )

# runner = CrawlerRunner()
# task = LoopingCall(lambda: runner.crawl(MySpider))
# task.start(30)
# reactor.run()

# process1 = CrawlerProcess(
#     settings={
#         "FEEDS": {
#             "items.json": {"format": "json"},
#         },
#     }
# )

# process1.crawl(MySpider)
# process1.start()  # the script will block here until the crawling is finished
# d = process1.stop()

# runner = CrawlerRunner()

# d = runner.crawl(MySpider)
# d.addBoth(lambda _: reactor.stop())
# reactor.run() 
