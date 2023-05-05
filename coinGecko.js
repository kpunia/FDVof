document.addEventListener('DOMContentLoaded', (event) => {

    // define API endpoint and parameters
    const apiEndpoint = 'https://api.coingecko.com/api/v3/coins/markets';
    var calculateButton = document.getElementById("calculate");

    // make HTTP requests to API endpoint to get cryptocurrency prices
    calculateButton.addEventListener("click", function() {
        // retrieve selected cryptocurrencies from dropdown menus
        const crypto1 = document.querySelector('[name=crypto1]').value;
        const crypto2 = document.querySelector('[name=crypto2]').value;
        // retrieve HTML element to hold result
        const resultHead = document.getElementById('result_head');
        const resultElement = document.getElementById('result');
        
        // make HTTP requests to API endpoint to get cryptocurrency prices
        const promises = [
            fetch(`${apiEndpoint}?vs_currency=usd&ids=${crypto1}&sparkline=false`),
            fetch(`${apiEndpoint}?vs_currency=usd&ids=${crypto2}&sparkline=false`)
        ];

        //Confusing
        Promise.all(promises)
        .then(responses => Promise.all(responses.map(r => r.json())))
        .then(data => {
            // extract cryptocurrency prices from response data
            var numTokens1 = data[0][0].max_supply;
            const fdv2 = data[1][0].fully_diluted_valuation;
            if (numTokens1 == null) {
                numTokens1 = data[0][0].fully_diluted_valuation / data[0][0].current_price
            }
            // calculate and display the FDV
            const fdv1 = (fdv2 / numTokens1).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
            resultHead.textContent = `The price of ${crypto1} given the FDV of ${crypto2}:`
            resultElement.textContent = fdv1;
        })
        .catch(error => console.error('Error:', error));
    })
})