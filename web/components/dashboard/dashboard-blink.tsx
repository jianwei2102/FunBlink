'use client';

import { Divider } from 'antd';
import CreateBlink from './create-blink';

export default function DashboardBlink() {
  return (
    <div className="mt-10 mx-10">
      <CreateBlink />
      <Divider className="bg-white my-10" />
      <div className="flex flex-row justify-between">
        {/* <div className="basis-1/3 p-4 text-center flex align-middle justify-center">
          <div className="w-full cursor-default overflow-hidden rounded-2xl border border-stroke-primary bg-white shadow-action">
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
                    trust the source. This Action will not unfurl on X until it
                    is registered.
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
        </div> */}
      </div>
    </div>
  );
}
