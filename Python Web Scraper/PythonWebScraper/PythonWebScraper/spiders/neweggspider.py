import scrapy
from scrapy import Spider

class NeweggSpider(Spider):
    name = 'newegg'
    allowed_domains = [
        "newegg.com",
        "newegg.ca"
    ]
    price: float
    id: str
    def __init__(self, start_url = None, **kwargs):
        super().__init__(**kwargs)
        self.start_urls.append(start_url)
        # self.price = price
        # self.id = id

    def start_requests(self):
        headers = {
            'user-agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36'
        }
        for url in self.start_urls:
            yield scrapy.Request(url=url, headers=headers, callback=self.parse)
    def parse(self, response):
        price = response.xpath("//div[@class='product-buy-box']//li[@class='price-current']")
        price2 = price.xpath(".//*")
        numStr = ''.join(price2.xpath("./text()").getall())
        num = float(numStr)
        print(num)
        yield {'price': num}