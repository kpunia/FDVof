document.addEventListener('DOMContentLoaded', (event) => {

    // define API endpoint
    const apiEndpoint = 'https://api.coingecko.com/api/v3/coins/markets';

    var calculateButton = document.getElementById("calculate");

    // make HTTP requests to API endpoint to get crypto prices
    calculateButton.addEventListener("click", function() {

        // retrieve selected cryptos from dropdown menus
        const currency = document.querySelector('#currency').value
        const selectCrypto1 = document.querySelector('[name=crypto1]');
        const selectCrypto2 = document.querySelector('[name=crypto2]')
        // get rid of the first character which is there for sorting
        const crypto1 = selectCrypto1.value.substring(1);
        const crypto2 = selectCrypto2.value.substring(1);
        const crypto1Name = selectCrypto1.options[selectCrypto1.selectedIndex].text;
        const crypto2Name = selectCrypto2.options[selectCrypto2.selectedIndex].text;

        // retrieve HTML element to hold result
        const resultHead = document.getElementById('result_head');
        const resultElement = document.getElementById('result');
        
        if (!crypto1 || !crypto2) {
            resultHead.textContent = `Please select a coin`
            resultElement.textContent = ""
        } else if (crypto1.substring(0, 1) == "$" && crypto2.substring(0, 1) == "$") {
            resultHead.textContent = `A and B cannot both be manual entries`
            resultElement.textContent = ""
        } else if (crypto1.substring(0, 1) == "$") {
            fetch(`${apiEndpoint}?vs_currency=${currency}&ids=${crypto2}&sparkline=false`)
            .then(response => response.json())
            .then(data => {
                const valuation1 = +crypto1.substring(1)
                const selectizeA = $('select[name=crypto1]')[0].selectize;
                const selectedValue = selectizeA.getValue();
                const selectedOption = selectizeA.options[selectedValue];
                const supply1 = selectedOption.supply;
                const price2 = data[0].current_price
                var fdv2 = data[0].fully_diluted_valuation
                if (fdv2 == null) {
                    fdv2 = data[0].circulating_supply * data[0].current_price
                }
                console.log(supply1);
                const price1 = (price2 / fdv2 * valuation1).toLocaleString('en-US', { style: 'currency', currency: currency });
                resultHead.textContent = `${crypto1Name} with the FDV of ${crypto2Name}:`
                if (supply1 != 0) {
                    const priceRatio = ((price2 / fdv2 * valuation1)/(valuation1 / supply1)).toFixed(2);
                    if (priceRatio >= 1) {
                        resultElement.innerHTML = `${price1} <span style="color: lime;">(${priceRatio}x)</span>`;
                    } else {
                        resultElement.innerHTML = `${price1} <span style="color: red;">(${priceRatio}x)</span>`;
                    }
                } else {
                    resultElement.textContent = price1;
                }
            })
            .catch(error => {
                alert('CoinGecko is processing too many calls right now. Please try again later');
                console.error('Error:', error);
            });
        } else if (crypto2.substring(0, 1) == "$") {
            fetch(`${apiEndpoint}?vs_currency=${currency}&ids=${crypto1}&sparkline=false`)
            .then(response => response.json())
            .then(data => {
                var numTokens1 = data[0].max_supply
                const valuation2 = +crypto2.substring(1)
                if (numTokens1 == null) {
                    if (data[0].fully_diluted_valuation == null) {
                        numTokens1 = data[0].circulating_supply
                    }
                    else {
                        numTokens1 = data[0].fully_diluted_valuation / data[0].current_price
                    }
                }
                const priceRatio = +(valuation2 / numTokens1 / data[0].current_price).toFixed(2);
                const price1 = (valuation2 / numTokens1).toLocaleString('en-US', { style: 'currency', currency: currency });
                resultHead.textContent = `${crypto1Name} with the private valuation of ${crypto2Name}:`
                if (priceRatio >= 1) {
                    resultElement.innerHTML = `${price1} <span style="color: lime;">(${priceRatio}x)</span>`;
                } else {
                    resultElement.innerHTML = `${price1} <span style="color: red;">(${priceRatio}x)</span>`;
                }
                //resultElement.textContent = `${price1} (${priceRatio}x)`
            })
            .catch(error => {
                alert('CoinGecko is processing too many calls right now. Please try again later');
                console.error('Error:', error);
            });
        } else {
            // make HTTP requests to API endpoint to get crypto prices
            const promises = [
                fetch(`${apiEndpoint}?vs_currency=${currency}&ids=${crypto1}&sparkline=false`),
                fetch(`${apiEndpoint}?vs_currency=${currency}&ids=${crypto2}&sparkline=false`)
            ];

            // confusing
            Promise.all(promises)
            .then(responses => Promise.all(responses.map(r => r.json())))
            .then(data => {
                // extract cryptocurrency prices from response data
                var numTokens1 = data[0][0].max_supply;
                var fdv2 = data[1][0].fully_diluted_valuation;
                if (numTokens1 == null) {
                    if (data[0][0].fully_diluted_valuation == null) {
                        numTokens1 = data[0][0].circulating_supply
                    }
                    else {
                        numTokens1 = data[0][0].fully_diluted_valuation / data[0][0].current_price
                    }
                }// eth, sol, dot, trx, ton, usdt, usdc, busd, apt, cro, near, grt, usdp || doge, shiba, leo, atom, xmr, tusd, eos, rpl
                if (fdv2 == null) {
                    fdv2 = data[1][0].circulating_supply * data[1][0].current_price
                }// doge, shiba, leo, atom, xmr, tusd, eos, rpl
                
                // calculate and display the FDV
                const priceRatio = +(fdv2 / numTokens1 / data[0][0].current_price).toFixed(2);
                const price1 = (fdv2 / numTokens1).toLocaleString('en-US', { style: 'currency', currency: currency });
                resultHead.textContent = `${crypto1Name} with the FDV of ${crypto2Name}:`
                if (priceRatio >= 1) {
                    resultElement.innerHTML = `${price1} <span style="color: lime;">(${priceRatio}x)</span>`;
                } else {
                    resultElement.innerHTML = `${price1} <span style="color: red;">(${priceRatio}x)</span>`;
                }
                //resultElement.textContent = `${price1} (${priceRatio}x)`
            })
            .catch(error => {
                alert('CoinGecko is processing too many calls right now. Please try again later');
                console.error('Error:', error);
            });
        }
    })

    // Adding manual cryptocurrency
    document.getElementById('add').addEventListener('click', function() {
        var name = document.getElementById('name').value;
        var valuation = document.getElementById('valuation').value;
        var supply = document.getElementById('supply').value;
    
        // Validation for Private Valuation
        if (isNaN(valuation)) {
            alert("Please enter a number for Private Valuation");
            return;
        }

        if (isNaN(supply)) {
            alert("Please enter a number for Total Supply");
            return;
        }

        valuation = "$$" + valuation;

        var selectizeA = $('select[name=crypto1]')[0].selectize;
        var selectizeB = $('select[name=crypto2]')[0].selectize;
    
        selectizeA.addOption({value: valuation, text: name, supply: supply});
        selectizeB.addOption({value: valuation, text: name, supply: supply});

        document.getElementById('name').value = '';
        document.getElementById('valuation').value = '';
        document.getElementById('supply').value = '';
        document.getElementById('manual').style.display = 'none';
    });
})