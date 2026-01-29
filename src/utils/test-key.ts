import crypto from 'crypto';

const rawKey = `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCgk2xWd7FHHCmH
JZpjEJbf+4tJm+ae8Mzc5EmlmooiNgKywZ21tE51IMGLQMX07mjNJif/o4y84VrQ
/8fTqFC2Ok9k5LKRz39QSSxJL8D60ZjOUXZRAN8i7by/NdJLoPQJM38Z/6sgHX+3
f6VH4uo6iZipJd7I/VsEDQf+uUx/mwHFK7ryBYeN5JfjmQp21fkzQF6JN2zuX0B4
JsHFEGxjMYIu4E+PyPKybxpUz8nqe9Q2Dbs7F7C6QPeRp5rcE1mxd3U/1oiJc+ue
whXBcAllwwMinYo+cCDwv8kkhJNG0A5goXfYWFB9IasbOgwDNqrrngLq+ewCOO2F
2XqHEljVAgMBAAECggEACWepFEVtajNRkVtX+A5sL9E9XsHVV6DV9ugeEieDiK5u
KQcjFBXr9HtHKr9P+OEP3VgrRpNPNm7ikVQx4Yk9tPakWM32UYj8NXkbsWutG2O0
Vf06d1McPqD7CZ3+47QZJwLPonexj696oAZHaXb2bhhKCzovGsmQD6QtwDMdMmoL
h6LyI1I6WD051lMRVlwlkuOHkPIwPGm0VOTCczWhAUMMQi0OULTE+RZ7N/JMR+SX
2ENxgmmhGCNqaws4ADtwOSQZH25Lz11OruX1HAaiZiD5lqTVF/1gU4gLuIZ9nIhJ
o1MxmLy/GCM4Ae5bXL/b1kFCTT18vRlnvtmkcZb+EQKBgQDMljM3y/ysHD4P2yjY
rry2ViE8zWHeDdSCdJjr3zgEeiN9Os3YZo7icloH7fZ9XKyVBu+Duqu0izLCt/ea
hPmH9993xmwwAGyh5fCBIU5Qw6J7ZCQIKq569Hzn/FsifSCJGMWvHDVadXqqbbQ0
pcSkMhSQj4rGeO4/ZpckHVEZGQKBgQDI7djQoLEDBzzRfdts8WHtZQjTeLDl+Jay
gLruJIf+V9PturqQp03CXNz/CEcG2On5iHeRHOgzJ3Os93TomdS6grevV4HwYkWt
A4FQu8J0p+eG3n4Pi1am9WaCjGuXM4igngDe2SABJFe6iln4ozl/mQSOxLB5Otn6
1cVvkvmpHQKBgBKFYnuhpu053VB4Kbl8EC99mqKzgTGmFN/+iD2KRrr5B691nF8D
4dmUOpxPKaptsl4Hc7V8N8EvfNft6ad+dEyf3wYr2215DFyXwW8fQcTEATikdzKa
EpOlAI3L5cA4jbJ7oKHaruXSjtlQ9yhw/V1T/1Ka/Bg9qGvq8LHfSZE5AoGAJYFI
DEFCaUdLkesFL0OrPM20JQ0NMBADyRQAUH1fKRmpxGEre97Ow+3jjnM0FtIccmiH
sP2NVicSD4ItP1GfhKTrtn4GEiG10cKqu7Agbvf8Xo9fRnWC2i1KUin110ZWRWzY
ysAKmkv3WCmE+8Uz8V5VnHSYYDidAZYvgVEU6v0CgYBF7wI55xIpUD3vJVkwnBaq
ndhd53PPQL4BGSVZ1MgePghklnMZrfkkJImxPZ1fyk0vxAKctYIB2gIycfnDA9Id2
rAg8C3VkDlseu2tu+hQ+958l8FijTkfpoktzQg+JtmFiUPrc2K6uB8aSVKP5UIAt
VCqv8IGOL7SSlDpQBLpWnA==
-----END PRIVATE KEY-----`;

console.log('Testing Raw Key...');
try {
    crypto.createPrivateKey(rawKey);
    console.log('✅ RAW KEY IS VALID');
} catch (e) {
    console.error('❌ RAW KEY FAILED:', e.message);
}

const cleanedBody = rawKey
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\s+/g, '');

const chunked = cleanedBody.match(/.{1,64}/g)?.join('\n');
const reconstructedKey = `-----BEGIN PRIVATE KEY-----\n${chunked}\n-----END PRIVATE KEY-----\n`;

console.log('\nTesting Reconstructed Key...');
try {
    crypto.createPrivateKey(reconstructedKey);
    console.log('✅ RECONSTRUCTED KEY IS VALID');
} catch (e) {
    console.error('❌ RECONSTRUCTED KEY FAILED:', e.message);
}
