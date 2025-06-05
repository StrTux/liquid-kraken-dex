import express, { Handler } from 'express';

const app = express();
app.use(express.json());

let ETH_BALANCE = 200;
let USDC_BALANCE = 70000;

interface TradeRequest {
  quantity: number;
}

const buyAsset: Handler = (req, res) => {
  const { quantity } = req.body as TradeRequest;

  const pricePerETH = USDC_BALANCE / ETH_BALANCE;
  // yaha pe  hua ye ki  usdc = 70000 / 200 eth  se aata  hay  350
  const paidAmount = quantity * pricePerETH;
  // yaha  oe aata hay  // paidAmount = 350 - price per  eth  * 2 - quanity  = 700  
  //  ye lene ke baad 200 -2 eth  from balance = 198 eth  balance  ho jayega
  // or 70000 + 700 = 70700 usdc balance ho jayega


  if (quantity > ETH_BALANCE) {
    return res.status(400).json({
      error: 'Not enough ETH in liquidity pool',
    });
  }

  ETH_BALANCE -= quantity;
  USDC_BALANCE += paidAmount;
  // fir yaha  ab  eth 198 hua  and balance  70700 usdc ho jayega
  // 70700 / 198 = 356.56 price per eth ho jayega 



  return res.json({
    message: `You bought ${quantity} ETH for ${paidAmount.toFixed(2)} USDC`,
    pricePerETH: pricePerETH.toFixed(2),
    remaining: { ETH_BALANCE, USDC_BALANCE },
  });
};

const sellAsset: Handler = (req, res) => {
  const { quantity } = req.body as TradeRequest;

  const pricePerETH = USDC_BALANCE / ETH_BALANCE;
    // yaha pe  hua ye ki  usdc = 70700 / 198 eth  se aata  hay  356.56
  const receivedAmount = quantity * pricePerETH;
    // yaha  oe aata hay  // receivedAmount = 356.56 - price per  eth  * 2 - quanity  = 713.12

  if (receivedAmount > USDC_BALANCE) {
    return res.status(400).json({
      error: 'Not enough USDC in liquidity pool',
    });
  }

  ETH_BALANCE += quantity;
  USDC_BALANCE -= receivedAmount;
    // fir yaha  ab  eth 200 hua  and balance  69986.88 usdc ho jayega
    // 69986.88 / 200 = 349.93 price per eth ho jayega

  return res.json({
    message: `You sold ${quantity} ETH and received ${receivedAmount.toFixed(2)} USDC`,
    pricePerETH: pricePerETH.toFixed(2),
    remaining: { ETH_BALANCE, USDC_BALANCE },
  });
};

const quotes: Handler = (_req, res) => {
  const ethPrice = USDC_BALANCE / ETH_BALANCE;
  const usdcPrice = ETH_BALANCE / USDC_BALANCE;

  return res.json({
    message: `Current prices - ETH: ${ethPrice.toFixed(2)} USDC, USDC: ${usdcPrice.toFixed(6)} ETH`,
    liquidityPool: { ETH_BALANCE, USDC_BALANCE },
  });
};

app.post('/buy-asset', buyAsset);
app.post('/sell-asset', sellAsset);
app.post('/quotes', quotes);
app.get('/', (_req, res) => {
  res.send('Welcome to the Crypto Exchange API');
});
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

