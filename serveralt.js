const https = require('https');
const paymentAuth = "ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR0Z6Y3lJNklrMWxjbU5vWVc1MElpd2ljSEp2Wm1sc1pWOXdheUk2TnpVeU5UY3dMQ0p1WVcxbElqb2lhVzVwZEdsaGJDSjkuNDFiTDBadWdjWTZZV19PRURha2pjUVNDNnNDZXlSR2pwVjVLWGhmbVdCS1BtX2J1bXA3LWRrS0E2T29ybmx5WWRtdTVxVWFSeWp2SjRWR2FrclNETWc="
const data = JSON.stringify({ api_key: paymentAuth });

const options = {
  hostname: 'https://accept.paymob.com/api/auth/tokens',
  port: 443,
  path: '/api/endpoint',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, (res) => {
  console.log(`statusCode: ${res.statusCode}`);
  res.on('data', (d) => {
    process.stdout.write(d);
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.write(data);
req.end();
