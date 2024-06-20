# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://docs.scrapy.org/en/latest/topics/item-pipeline.html


# useful for handling different item types with a single interface
from itemadapter import ItemAdapter
import requests

API_ENDPOINT = "http://localhost:3000"

class PythonwebscraperPipeline:
    def process_item(self, item, spider):
        print("pipeline")
        print(item['price'])
        print(spider.price)
        if item['price'] < spider.price:
            try:
                print("hello")
                r = requests.post(API_ENDPOINT + '/notify-user/{}/{}'.format(spider.userid, spider.channelid), json={ 'notifid': spider.notifid, 'url': spider.start_urls[0], 'price': spider.price})
                print(r)
            except Exception as e:
                print(e)
        return item
