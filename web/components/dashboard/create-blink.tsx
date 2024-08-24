'use client';

import Image from 'next/image';
import { useState } from 'react';
import toast from 'react-hot-toast';
import idl from '../../public/funblink.json';
import img from '../../public/solana-token.png';
import { Connection, PublicKey, SystemProgram } from '@solana/web3.js';
import { AnchorProvider, Idl, Program, Wallet } from '@project-serum/anchor';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';

export default function CreateBlink() {
  const programId = new PublicKey(
    '31gp55u46dirwWEpeCHZv3qFKctxqsCr3GNMYCH99HAm'
  );

  //   const connection = new Connection(clusterApiUrl('devnet'));
  const { connection } = useConnection();
  const wallet = useAnchorWallet() as Wallet;

  const [toPubkey, setToPubkey] = useState('');
  const [manualSend, setManualSend] = useState(true);
  const [title, setTitle] = useState('Actions Example - Transfer Native SOL');
  const [description, setDescription] = useState(
    'Transfer SOL to another Solana wallet'
  );
  const [iconURL, setIconURL] = useState(
    'https://cdn-icons-png.flaticon.com/512/6001/6001527.png'
  );
  const [actions, setActions] = useState([
    { value: 1 },
    { value: 2 },
    { value: 5 },
  ]);

  // Add new action input
  const addAction = () => {
    if (actions.length < 9) {
      setActions([...actions, { value: 1 }]);
    }
  };

  // Remove action input by index
  const removeAction = (index: number) => {
    if (actions.length != 1) {
      setActions(actions.filter((_, i) => i !== index));
    }
  };

  // Validate and format the action input value
  const handleActionChange = (index: number, value: string) => {
    const regex = /^\d*\.?\d{0,3}$/; // Regex to allow up to 3 decimal places
    if (regex.test(value)) {
      const newActions = [...actions];
      newActions[index].value = parseFloat(value);
      setActions(newActions);
    }
  };

  // Convert to actual actions string
  const generateActionsString = (
    actions: { value: number }[],
    manualSend: boolean
  ) => {
    const baseHref = '${baseHref}';

    const actionStrings = actions.map((action) => {
      return `{"label":"Send ${action.value} SOL","href":"${baseHref}&amount=${action.value}"}`;
    });

    if (manualSend) {
      actionStrings.push(`{
        "label":"Send SOL",
        "href":"${baseHref}&amount={amount}",
        "parameters":[
          {
            "name":"amount",
            "label":"Enter the amount of SOL to send",
            "required":true
          }
        ]
      }`);
    }

    return `{
      "actions":[${actionStrings.join(',')}]
    }`;
  };

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = {
      title,
      description,
      iconURL,
      toPubkey,
      actions: JSON.stringify(generateActionsString(actions, manualSend)),
    };

    console.log('Form Data Submitted:', formData);

    try {
      // Ensure the wallet is connected
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

      const anchorProvider = getProvider(connection, wallet);

      const program = new Program(idl as Idl, programId, anchorProvider);
      console.log('Blink Account:', blinkAccount.toBase58());
      let id;
      try {
        const blinks = await program.account.blinkList.fetch(blinkAccount);
        console.log('Blinks:', blinks);
        const lastElement = blinks.blinks[blinks.blinks.length - 1];
        id = parseInt(lastElement.id) + 1;
      } catch (error) {
        console.log('Error fetching blink:', error);
        id = 0;
      }

      await program.methods
        .createBlink(
          id?.toString(),
          title,
          iconURL,
          description,
          'Transfer',
          toPubkey,
          JSON.stringify(generateActionsString(actions, manualSend))
        )
        .accounts({
          blinkList: blinkAccount,
          signer: anchorProvider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([])
        .rpc();
      toast.success('Blink created successfully');
    } catch (error) {
      console.error('Error creating blink:', error);
    }
  };

  return (
    <div className="flex flex-row justify-between gap-8">
      <div className="basis-1/2 border rounded-lg p-4 min-h-[760px]">
        <div className="flex flex-col justify-between h-12">
          <div className="flex justify-center items-center">
            <div className="font-semibold text-4xl text-[#6495ED]">
              Create Blink
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            <div>
              <label htmlFor="title" className="font-medium text-lg">
                Blink&apos;s Title <span className="text-red-400">*</span>
              </label>
              <input
                required
                id="title"
                type="text"
                placeholder="Please enter the title of the Blink"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border-slate-400 border-2 shadow-sm px-4 py-2"
              />
            </div>

            <div className="mt-2">
              <label htmlFor="icon" className="font-medium text-lg">
                Icon (URL) <span className="text-red-400">*</span>
              </label>
              <input
                required
                id="icon"
                type="text"
                placeholder="Please enter a URL for the icon"
                value={iconURL}
                onChange={(e) => setIconURL(e.target.value)}
                className="w-full rounded-md border-slate-400 border-2 shadow-sm px-4 py-2"
              />
            </div>
            <div className="mt-2">
              <label htmlFor="description" className="font-medium text-lg">
                Description <span className="text-red-400">*</span>
              </label>
              <input
                required
                id="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border-slate-400 border-2 shadow-sm px-4 py-2"
              />
            </div>
            <div className="mt-2">
              <label htmlFor="toPubkey" className="font-medium text-lg">
                To Targeted Address <span className="text-red-400">*</span>{' '}
                (Please ensure the address is correct)
              </label>
              <input
                required
                id="toPubkey"
                type="text"
                value={toPubkey}
                onChange={(e) => setToPubkey(e.target.value)}
                className="w-full rounded-md border-slate-400 border-2 shadow-sm px-4 py-2"
              />
            </div>
            <div className="mt-2">
              <input
                type="checkbox"
                id="manualSend"
                checked={manualSend}
                onChange={() => setManualSend(!manualSend)}
                className="mr-2"
              />
              <label htmlFor="manualSend" className="font-medium text-lg">
                Send X amount (Manual)
              </label>
            </div>
            {/* Action Input Section */}
            <div className="mt-4">
              <div className="mb-2 font-medium text-lg">
                Link Actions <span className="text-red-400">*</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {actions.map((action, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="mr-2">Amount {index + 1}</span>
                    <input
                      required
                      type="number"
                      step="0.001" // Added step attribute to enable decimal input
                      value={action.value}
                      onChange={(e) =>
                        handleActionChange(index, e.target.value)
                      }
                      className="w-20 rounded-md border-slate-400 border-2 shadow-sm px-4 py-2"
                    />
                    <button
                      type="button"
                      onClick={() => removeAction(index)}
                      className="text-red-500 hover:text-red-700 text-2xl"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addAction}
                className="mt-4 text-blue-500 hover:text-blue-700"
              >
                Add Action
              </button>
            </div>
            <div>
              <button
                type="submit"
                className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-full text-center font-semibold"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="basis-1/2 p-4 text-center flex align-middle justify-center">
        <div className="w-2/3 cursor-default overflow-hidden rounded-2xl border border-stroke-primary bg-white shadow-action">
          <div className="max-h-[100cqw] overflow-y-hidden px-5 pt-5 flex justify-center">
            <Image
              className="aspect-auto rounded-xl object-cover object-center"
              src={iconURL || img}
              alt="blink-icon"
              width={200}
              height={200}
            />
          </div>
          <div className="flex flex-col p-5 text-start text-black">
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-flex items-center truncate text-subtext text-text-link">
                localhost:3000
              </span>
              <a
                href="https://docs.dialect.to/documentation/actions/security"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
              >
                <div className="group bg-transparent-warning inline-flex items-center justify-center gap-1 rounded-full text-subtext font-semibold leading-none aspect-square p-1">
                  <div className="text-icon-warning group-hover:text-icon-warning-hover transition-colors motion-reduce:transition-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="13"
                      height="13"
                      fill="none"
                      viewBox="0 0 16 16"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <path
                        fill="orange"
                        fillRule="evenodd"
                        d="M13.863 3.42 8.38 1.088a.932.932 0 0 0-.787 0L2.108 3.421c-.641.291-1.137.904-1.108 1.662 0 2.916 1.196 8.195 6.212 10.616.496.233 1.05.233 1.546 0 5.016-2.42 6.212-7.7 6.241-10.616 0-.758-.496-1.37-1.137-1.662Zm-6.33 7.35h-.582a.69.69 0 0 0-.7.7c0 .408.292.7.7.7h2.216c.379 0 .7-.292.7-.7 0-.38-.321-.7-.7-.7h-.234V8.204c0-.38-.32-.7-.7-.7H7.208a.69.69 0 0 0-.7.7c0 .408.292.7.7.7h.326v1.866Zm-.466-5.133c0 .525.408.933.933.933a.94.94 0 0 0 .933-.933A.96.96 0 0 0 8 4.704a.94.94 0 0 0-.933.933Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                </div>
              </a>
            </div>
            <span className="mb-0.5 text-text font-semibold text-text-primary">
              {title}
            </span>
            <span className="mb-4 whitespace-pre-wrap text-subtext text-text-secondary">
              {description}
            </span>
            <div className="mb-4">
              <div className="bg-transparent-warning text-text-warning border-stroke-warning rounded-lg border p-3 text-subtext border-[#ffbc6e] text-[#d55f00]">
                <p>
                  This Action has not yet been registered. Only use it if you
                  trust the source. This Action will not unfurl on X until it is
                  registered.
                </p>
                <a
                  className="mt-3 inline-block font-semibold transition-colors hover:text-text-warning-hover motion-reduce:transition-none"
                  href="https://discord.gg/saydialect"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Report
                </a>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {actions.map((action, index) => (
                  <div
                    key={index}
                    className="flex flex-grow basis-[calc(33.333%-2*4px)]"
                  >
                    <div className="text-white bg-black rounded-lg flex w-full items-center justify-center text-nowrap rounded-button px-4 py-3 text-text font-semibold transition-colors motion-reduce:transition-none bg-button text-text-button hover:bg-button-hover">
                      <span className="min-w-0 truncate">
                        Send {action.value} SOL
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              {manualSend && (
                <div>
                  <div className="peer relative flex min-h-10 items-center gap-1.5 border border-input-stroke py-1.5 pl-4 pr-1.5 transition-colors motion-reduce:transition-none focus-within:has-[:invalid]:border-input-stroke-error focus-within:has-[:valid]:border-input-stroke-selected focus-within:hover:has-[:invalid]:border-input-stroke-error focus-within:hover:has-[:valid]:border-input-stroke-selected hover:has-[:enabled]:border-input-stroke-hover rounded-input-standalone">
                    <div className="font-thin flex-1 truncate bg-input-bg text-text-input outline-none placeholder:text-text-input-placeholder disabled:text-text-input-disabled">
                      Enter the amount of SOL to send
                    </div>
                    <div className="min-w-0">
                      <div className="text-white bg-[#737373] rounded-lg  flex w-full items-center justify-center text-nowrap rounded-button px-4 py-3 text-text font-semibold transition-colors motion-reduce:transition-none bg-button-disabled text-text-button-disabled">
                        <span className="min-w-0 truncate">Send SOL</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
