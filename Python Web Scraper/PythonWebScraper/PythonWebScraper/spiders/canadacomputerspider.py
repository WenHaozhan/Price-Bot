import scrapy
from scrapy import Spider
import locale

class CanadaComputerSpider(Spider):
    name = 'canadacomputers'
    allowed_domains = [
        "canadacomputers.com"
    ]
    price: float

    def __init__(self, start_url = None, **kwargs):
        super().__init__(**kwargs)
        self.start_urls.append(start_url)

    def start_requests(self):
        headers = {
            'user-agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36'
        }
        for url in self.start_urls:
            yield scrapy.Request(url=url, headers=headers, callback=self.parse)
    def parse(self, response):
        price = response.xpath("//div[contains(@class, 'price-show-panel')]/div[1]//strong/text()").get()
        locale.setlocale(locale.LC_ALL, '')
        price = locale.atof(price[1:])
        yield {'price': price}