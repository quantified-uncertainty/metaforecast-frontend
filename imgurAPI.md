 For public read-only and anonymous resources, such as getting image info, looking up user comments, etc. all you need to do is send an authorization header with your client_id in your requests. This also works if you'd like to upload images anonymously (without the image being tied to an account), or if you'd like to create an anonymous album. This lets us know which application is accessing the API. 
 https://api.imgur.com/oauth2/addclient

Client ID:0cf5927817c9055
Client secret: 3134616b2dd7f27d59652fd2e757fe15b053a7c1

The Imgur API uses a credit allocation system to ensure fair distribution of capacity. Each application can allow approximately 1,250 uploads per day or approximately 12,500 requests per day. If the daily limit is hit five times in a month, then the app will be blocked for the rest of the month. The remaining credit limit will be shown with each requests response in the X-RateLimit-ClientRemaining HTTP header.

https://api.imgur.com/3/


https://api.imgur.com/oauth2/authorize?client_id=0cf5927817c9055&response_type=token
https://imgur.com/#access_token=8e9666fb889318515a62208560d4e8393dac26d8&expires_in=315360000&token_type=bearer&refresh_token=980c924d08d2dd9eb9e371b4f61bc52bce7f5b8f&account_username=LokiOdinevich&account_id=139593611

Access Token: 8e9666fb889318515a62208560d4e8393dac26d8
expires_in=315360000

Authorization: Bearer 8e9666fb889318515a62208560d4e8393dac26d8
