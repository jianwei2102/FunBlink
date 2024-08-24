/**
 * FunBlink Actions Example
 */

import {
  ActionGetRequest,
  ActionPostRequest,
  ActionPostResponse,
  createActionHeaders,
} from '@solana/actions';
import {
  clusterApiUrl,
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';

// Create the standard headers for this route (including CORS)
const headers = createActionHeaders();

const DEFAULT_SOL_AMOUNT = 0.1;
const DEFAULT_SOL_ADDRESS: PublicKey = new PublicKey(
  '5ufHigmjsV3ucetqXxZgZuYkmHyRiyYPYm5RSM8y2WFQ' // devnet wallet
);

export async function GET(req: Request) {
  try {
    const requestUrl = new URL(req.url);
    const userPDAPayload = await loadUserPDA(requestUrl);
    // const { toPubkey } = validatedQueryParams(requestUrl);

    if (!userPDAPayload) {
      throw new Error('Failed to load user PDA');
      // disabled
    }

    const parsedLinks = JSON.parse(userPDAPayload.links);
    const baseHref = new URL(
      `/api/actions?to=${userPDAPayload.toPubkey}`,
      requestUrl.origin
    ).toString();

    const defaultLinks = {
      actions: [
        {
          label: 'Send 1 SOL', // button text
          href: `${baseHref}&amount=${'1'}`,
        },
        {
          label: 'Send 5 SOL', // button text
          href: `${baseHref}&amount=${'5'}`,
        },
        {
          label: 'Send 10 SOL', // button text
          href: `${baseHref}&amount=${'10'}`,
        },
        {
          label: 'Send SOL', // button text
          href: `${baseHref}&amount={amount}`, // this href will have a text input
          parameters: [
            {
              name: 'amount', // parameter name in the `href` above
              label: 'Enter the amount of SOL to send', // placeholder of the text input
              required: true,
            },
          ],
        },
      ],
    };

    const payload: ActionGetRequest = {
      title: userPDAPayload?.title ?? 'Actions Example - Transfer Native SOL',
      icon:
        userPDAPayload?.icon ??
        new URL('/solana-token.png', requestUrl.origin).toString(),
      description:
        userPDAPayload?.description ?? 'Transfer SOL to another Solana wallet',
      label: userPDAPayload?.label ?? 'Transfer',
      // error: { message: 'Invalid address provided' },
      // disabled: true,
      links: {
        actions: parsedLinks.actions,
      },
    };

    return Response.json(payload, {
      headers,
    });
  } catch (err) {
    console.log(err);
    let message = 'An unknown error occurred';
    if (typeof err == 'string') message = err;
    return new Response(message, {
      status: 400,
      headers,
    });
  }
}

export async function POST(req: Request) {
  try {
    const requestUrl = new URL(req.url);
    const { amount, toPubkey } = validatedQueryParams(requestUrl);

    const body: ActionPostRequest = await req.json();

    // validate the client provided input
    let account: PublicKey;
    try {
      account = new PublicKey(body.account);
    } catch (err) {
      return new Response('Invalid "account" provided', {
        status: 400,
        headers,
      });
    }

    const connection = new Connection(clusterApiUrl('devnet'));

    // ensure the receiving account will be rent exempt
    const minimumBalance = await connection.getMinimumBalanceForRentExemption(
      0 // note: simple accounts that just store native SOL have `0` bytes of data
    );
    if (amount * LAMPORTS_PER_SOL < minimumBalance) {
      throw `account may not be rent exempt: ${toPubkey.toBase58()}`;
    }

    // create an instruction to transfer native SOL from one wallet to another
    const transferSolInstruction = SystemProgram.transfer({
      fromPubkey: new PublicKey(account),
      toPubkey: toPubkey,
      lamports: amount * LAMPORTS_PER_SOL,
    });

    // create a transaction
    const tx = new Transaction();
    tx.feePayer = new PublicKey(account);
    tx.recentBlockhash = (
      await connection.getLatestBlockhash({ commitment: 'finalized' })
    ).blockhash;
    tx.add(transferSolInstruction);

    const serialTX = tx
      .serialize({ requireAllSignatures: false, verifySignatures: false })
      .toString('base64');

    const payload: ActionPostResponse = {
      transaction: serialTX,
      message: `Send ${amount} SOL to ${toPubkey.toBase58()}`,
    };

    return Response.json(payload, {
      headers,
    });
  } catch (err) {
    console.log(err);
    let message = 'An unknown error occurred';
    if (typeof err == 'string') message = err;
    return new Response(message, {
      status: 400,
      headers,
    });
  }
}

// DO NOT FORGET TO INCLUDE THE `OPTIONS` HTTP METHOD
// THIS WILL ENSURE CORS WORKS FOR BLINKS
export const OPTIONS = async (req: Request) => {
  return new Response(null, { headers });
};

function validatedQueryParams(requestUrl: URL) {
  let toPubkey: PublicKey = DEFAULT_SOL_ADDRESS;
  let amount: number = DEFAULT_SOL_AMOUNT;

  try {
    if (requestUrl.searchParams.get('to')) {
      toPubkey = new PublicKey(requestUrl.searchParams.get('to')!);
    }
  } catch (err) {
    throw 'Invalid input query parameter: to';
  }

  try {
    if (requestUrl.searchParams.get('amount')) {
      amount = parseFloat(requestUrl.searchParams.get('amount')!);
    }

    if (amount <= 0) throw 'amount is too small';
  } catch (err) {
    throw 'Invalid input query parameter: amount';
  }

  return {
    amount,
    toPubkey,
  };
}

function loadUserPDA(requestUrl: URL) {
  const retrieveStatus = true;
  if (retrieveStatus) {
    const title = 'Actions Example - Transfer Native SOL';
    const icon = new URL('/solana-token.png', requestUrl.origin).toString();
    const description = 'Transfer SOL to another Solana wallet';
    const label = 'Transfer';
    const toPubkey = '5ufHigmjsV3ucetqXxZgZuYkmHyRiyYPYm5RSM8y2WFQ';
    const links =
      // '{"actions":[{"label":"Send 1 SOL","href":"${baseHref}?&amount=1"},{"label":"Send 5 SOL","href":"${baseHref}?&amount=5"},{"label":"Send 10 SOL","href":"${baseHref}?&amount=10"},{"label":"Send SOL","href":"${baseHref}?&amount={amount}","parameters":[{"name":"amount","label":"Enter the amount of SOL to send","required":true}]}]}';
      '{\n      "actions":[{"label":"Send 1 SOL","href":"${baseHref}&amount=1"},{"label":"Send 2 SOL","href":"${baseHref}&amount=2"},{"label":"Send 5 SOL","href":"${baseHref}&amount=5"},{"label":"Send 144 SOL","href":"${baseHref}&amount=144"},{"label":"Send 1 SOL","href":"${baseHref}&amount=1"},{"label":"Send 1 SOL","href":"${baseHref}&amount=1"}]\n    }';
    return {
      title,
      icon,
      description,
      label,
      toPubkey,
      links,
    };
  } else {
    return null;
  }
}
