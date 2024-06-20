import scrapy
from .myspider import MySpider
from scrapy import Spider
import locale

class AmazonSpider(Spider):
    name = 'amazon'
    allowed_domains = [
        "amazon.com",
        "amazon.ca"
    ]
    price: float
    def __init__(self, start_url = None, **kwargs):
        super().__init__(**kwargs)
        self.start_urls.append(start_url)
        # print("amazon spider const")


    def start_requests(self):
        headers = {
            'user-agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36'
        }
        print(self.start_urls)
        for url in self.start_urls:
            yield scrapy.Request(url=url, headers=headers, callback=self.parse)
    def parse(self, response):
        #assume a product page
        priceStr = response.xpath("//*[@id='corePrice_feature_div']//span[@class='a-offscreen']/text()").get()
        # print(response.body)
        #assume price has $ in front
        locale.setlocale(locale.LC_ALL, '')
        locale.setlocale(locale.LC_MONETARY, 'p_cs_precedes')
        price = locale.atof(priceStr[1:])
        print("parsing")
        yield {'price' : price}