let pup = require('puppeteer');
let axios = require('axios');
let credentials = require('./credentials.json');

(async () => {

    let browser = await pup.launch({
        headless: true
    });
    
    let page = (await browser.pages())[0];

    await page.goto('https://steamcommunity.com/saliengame/play/');

    await page.evaluate(cred => {

        $ = jQuery;

        $(document).ready(() => {

            $('#steamAccountName')[0].value = cred.username;
            $('#steamPassword')[0].value = cred.password;
            $('#SteamLogin').click();
            
        });

    }, credentials);

/*     if (await page.$('#error_display')){
        console.log('Login error');
        return;
    } */

    let salienshack = (await axios.get('https://cdn.rawgit.com/coryshaw1/saliens-hack/c67a4819/saliensHack.user.js')).data;

    process.stdout.write("Steam Guard code: ");
    process.openStdin().addListener("data", async d => {

        let code = d.toString().trim().toUpperCase();

        page.evaluate((code, salienshack) => {

            $ = jQuery;

            $('#twofactorcode_entry')[0].value = code;
            $('.loginTwoFactorCodeModal form').submit()

        }, code, salienshack);

        let interval = setInterval(async () => {
            if (await page.url() === "https://steamcommunity.com/saliengame/play") {

                page.evaluate(salienshack=> {

                    jQuery(document).ready(() => {
                        let script = document.createElement("SCRIPT");
                        script.innerHTML = salienshack;
                        document.head.appendChild(script);
                    });

                }, salienshack);

                console.log('Success!');
                clearInterval(interval);
            }
        }, 200);
    
    });
})();