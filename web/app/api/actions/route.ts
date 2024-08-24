/**
 * FunBlink Actions Example
 */

import idl from '../../../public/funblink.json';
import { AnchorProvider, Idl, Program } from '@project-serum/anchor';

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
    const blink = await loadUserPDA(requestUrl);

    if (!blink) {
      throw new Error('Failed to load blink');
    }

    // Calculate baseHref
    const baseHref = new URL(
      `/api/actions?to=${blink.toPubkey}`,
      requestUrl.origin
    ).toString();

    // Parse the link and replace ${baseHref} with the actual baseHref
    const blinkData = JSON.parse(JSON.parse(blink.link));
    const actions = blinkData.actions.map(
      (action: { label: string; href: string; parameters?: any[] }) => ({
        ...action,
        href: action.href.replace('${baseHref}', baseHref),
      })
    );
    console.log('Actions:', actions);

    const payload: ActionGetRequest = {
      title: blink.title ?? 'Actions Example - Transfer Native SOL',
      icon:
        blink.icon ??
        new URL('/solana-token.png', requestUrl.origin).toString(),
      description: blink.description ?? 'Transfer SOL to another Solana wallet',
      label: blink.label ?? 'Transfer',
      links: {
        actions: actions,
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
async function loadUserPDA(requestUrl: URL) {
  const pda = requestUrl.searchParams.get('pda') ?? '';
  const id = requestUrl.searchParams.get('id');

  try {
    const anchorProvider = new AnchorProvider(
      new Connection(clusterApiUrl('devnet')),
      null,
      AnchorProvider.defaultOptions()
    );

    const program = new Program(
      idl as Idl,
      '31gp55u46dirwWEpeCHZv3qFKctxqsCr3GNMYCH99HAm',
      anchorProvider
    );

    const blinks = await program.account.blinkList.fetch(pda);
    // console.log('Blinks:', blinks);

    // Filter the blink entry by id
    const blink = blinks.blinks.find(
      (blink: { id: string }) => blink.id === id
    );

    if (blink) {
      return blink;
    } else {
      console.error('Blink not found');
      return null;
    }
  } catch (error) {
    console.error('Error', error);
    return null;
  }
}
