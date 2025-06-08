import express, { Handler } from 'express';

const app = express();
app.use(express.json());

let ETH_BALANCE = 150;
let USDC_BALANCE = 1000;

interface TradeRequest {
  quantity: number;
}

const buyAsset: Handler = (req, res) => {
  const { quantity } = req.body as TradeRequest;

  if (quantity > ETH_BALANCE) {
    return res.status(400).json({
      error: 'Not enough ETH in liquidity pool',
    });
  }

  // yaha pe x * y = k use kar rahe hai 
  // x = eth_balance, y = usdc_balance, to k = x * y
  const k = ETH_BALANCE * USDC_BALANCE;

  const new_ETH_BALANCE = ETH_BALANCE - quantity;
  const new_USDC_BALANCE = k / new_ETH_BALANCE;

  const paidAmount = new_USDC_BALANCE - USDC_BALANCE;

  // fir ab hum balances update kar rahe hai
  ETH_BALANCE = new_ETH_BALANCE;
  USDC_BALANCE = new_USDC_BALANCE;

  // yaha pe price change ho chuki hai due to amm model
  // price per eth = new_USDC_BALANCE / new_ETH_BALANCE
  const pricePerETH = USDC_BALANCE / ETH_BALANCE;

  return res.json({
    message: `You bought ${quantity} ETH for ${paidAmount.toFixed(2)} USDC`,
    pricePerETH: pricePerETH.toFixed(2),
    remaining: { ETH_BALANCE, USDC_BALANCE },
  });
};

const sellAsset: Handler = (req, res) => {
  const { quantity } = req.body as TradeRequest;

  // x * y = k, x = eth, y = usdc
  const k = ETH_BALANCE * USDC_BALANCE;

  const new_ETH_BALANCE = ETH_BALANCE + quantity;
  const new_USDC_BALANCE = k / new_ETH_BALANCE;

  const receivedAmount = USDC_BALANCE - new_USDC_BALANCE;

  if (receivedAmount > USDC_BALANCE) {
    return res.status(400).json({
      error: 'Not enough USDC in liquidity pool',
    });
  }

  // fir yaha balances update kar rahe hai
  ETH_BALANCE = new_ETH_BALANCE;
  USDC_BALANCE = new_USDC_BALANCE;

  // naya price per eth = usdc / eth
  const pricePerETH = USDC_BALANCE / ETH_BALANCE;

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

