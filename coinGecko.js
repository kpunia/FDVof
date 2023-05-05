document.addEventListener('DOMContentLoaded', (event) => {

    // define API endpoint
    const apiEndpoint = 'https://api.coingecko.com/api/v3/coins/markets';

    var calculateButton = document.getElementById("calculate");

    // make HTTP requests to API endpoint to get crypto prices
    calculateButton.addEventListener("click", function() {
        
        // retrieve selected cryptos from dropdown menus
        const selectCrypto1 = document.querySelector('[name=crypto1]');
        const selectCrypto2 = document.querySelector('[name=crypto2]')
        const crypto1 = selectCrypto1.value;
        const crypto2 = selectCrypto2.value;
        const crypto1Name = selectCrypto1.options[selectCrypto1.selectedIndex].text;
        const crypto2Name = selectCrypto2.options[selectCrypto2.selectedIndex].text;

        // retrieve HTML element to hold result
        const resultHead = document.getElementById('result_head');
        const resultElement = document.getElementById('result');
        
        // make HTTP requests to API endpoint to get crypto prices
        const promises = [
            fetch(`${apiEndpoint}?vs_currency=usd&ids=${crypto1}&sparkline=false`),
            fetch(`${apiEndpoint}?vs_currency=usd&ids=${crypto2}&sparkline=false`)
        ];

        // confusing
        Promise.all(promises)
        .then(responses => Promise.all(responses.map(r => r.json())))
        .then(data => {
            // extract cryptocurrency prices from response data
            var numTokens1 = data[0][0].max_supply;
            const fdv2 = data[1][0].fully_diluted_valuation;
            if (numTokens1 == null) {
                numTokens1 = data[0][0].fully_diluted_valuation / data[0][0].current_price
            }// eth, sol, dot, trx, ton
            // calculate and display the FDV
            const fdv1 = (fdv2 / numTokens1).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
            resultHead.textContent = `The price of ${crypto1Name} with the FDV of ${crypto2Name}:`
            resultElement.textContent = fdv1;
        })
        .catch(error => console.error('Error:', error));
    })
})