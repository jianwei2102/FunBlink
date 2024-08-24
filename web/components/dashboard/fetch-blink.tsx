'use client';

import { useEffect, useState } from 'react';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import idl from '../../public/funblink.json';
import { Connection, PublicKey } from '@solana/web3.js';
import { AnchorProvider, Idl, Program, Wallet } from '@project-serum/anchor';
import BlinkDisplay from './blink-display';

const getProvider = (connection: Connection, wallet: Wallet) => {
  if (!wallet) {
    throw new Error('Wallet is not connected');
  }
  const provider = new AnchorProvider(
    connection,
    wallet,
    AnchorProvider.defaultOptions()
  );
  return provider;
};

export default function FetchBlink() {
  const programId = new PublicKey(
    '31gp55u46dirwWEpeCHZv3qFKctxqsCr3GNMYCH99HAm'
  );
  const { connection } = useConnection();
  const wallet = useAnchorWallet() as Wallet;

  // State to hold the blink list
  const [blinkList, setBlinkList] = useState<any[]>([]); // Changed to any[] to handle blink objects
  const [blinkAccount, setBlinkAccount] = useState<string>('');

  useEffect(() => {
    const fetchBlinkList = async () => {
      try {
        if (!wallet.publicKey) {
          throw new Error('Wallet is not connected');
        }

        const blinkSeeds = [
          Buffer.from('blink_list'),
          wallet.publicKey.toBuffer(),
        ].filter((seed) => seed !== undefined) as (Uint8Array | Buffer)[];

        const [blinkAccount] = await PublicKey.findProgramAddress(
          blinkSeeds,
          programId
        );
        setBlinkAccount(blinkAccount.toBase58());

        const anchorProvider = getProvider(connection, wallet);

        const program = new Program(idl as Idl, programId, anchorProvider);

        try {
          const blinks = await program.account.blinkList.fetch(blinkAccount);
          // Set the blink list state
          console.log('Blinks:', blinks);
          setBlinkList(blinks.blinks); // Update the blink list state
        } catch (error) {
          console.error('Failed to fetch blink list:', error);
        }
      } catch (error) {
        console.error('Error fetching blink list:', error);
      }
    };

    fetchBlinkList();
  }, [connection, wallet]);

  return (
    <div className="flex flex-col justify-center items-center w-full">
      {/* Map over the blinkList and pass each blink to the BlinkDisplay component */}
      {blinkList.map((blink, index) => (
        <BlinkDisplay
          key={blink.id}
          blink={blink}
          blinkAccount={blinkAccount}
        />
      ))}
      {blinkList.length === 0 && (
        <div className="text-center my-4 font-semibold text-2xl italic text-blue-200">
          No blinks created yet
        </div>
      )}
    </div>
  );
}
