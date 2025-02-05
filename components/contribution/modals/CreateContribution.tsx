import { useAccount, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useDebounce } from "usehooks-ts";
import contributionCategories from "../../../constants/categoryMapping";
import facadeAbi from "../../../constants/abi.json";
import addressesJson from "../../../constants/addresses.json";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import Image from "next/image";

export default function CreateContribution() {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(0);
  const [url, setUrl] = useState("");
  const inputToggle = useRef<HTMLInputElement>(null);
  const debouncedUrl = useDebounce(url, 300);
  const { config } = usePrepareContractWrite({
    addressOrName: addressesJson[process.env.NEXT_PUBLIC_CHAIN_ID as keyof typeof addressesJson].address,
    contractInterface: facadeAbi,
    functionName: "createContribution",
    args: [Number(category), title, debouncedUrl],
    enabled: Boolean(debouncedUrl),
  });
  const { write, data, isError, error } = useContractWrite(config);

  const { openConnectModal } = useConnectModal();
  const { isDisconnected } = useAccount();
  const { isLoading, isSuccess } = useWaitForTransaction({
    hash: data?.hash,
  });

  const handlePost = (e: React.FormEvent) => {
    if (isDisconnected) openConnectModal?.();
    write?.();
    e.preventDefault();
  };

  useEffect(() => {
    isSuccess
      ? toast.success("Post created")
      : isLoading
      ? toast.info("Creating new post...")
      : isError && toast.error(`${"Error : " + error?.message}`);
    if (isSuccess) {
      setTimeout(() => {
        if (inputToggle?.current) {
          inputToggle.current.checked = false;
        }
      }, 1000);
    }
  }, [isError, error, isSuccess, isLoading]);

  return (
    <>
      <label htmlFor="contribution-create-modal" className="hover:text-accent items-center flex cursor-pointer">
        <Image src="/images/plus.svg" width={22} height={22} alt="Post a News" />
      </label>
      <input type="checkbox" id="contribution-create-modal" className="modal-toggle" ref={inputToggle} />
      <div className="modal modal-bottom sm:modal-middle">
        <div className="modal-box">
          <label htmlFor="contribution-create-modal" className="btn btn-sm btn-circle absolute right-2 top-2">
            ✕
          </label>
          <h3 className="text-xl text-neutral">Post a contribution</h3>
          <form className="form-control mt-6">
            <label htmlFor="contribution-create-category" className="label max-w-lg font-semibold">
              <span className="label-text text-accent-content">Category</span>
            </label>
            <select
              id="contribution-create-category"
              className="mb-4 select select-bordered w-full max-w-lg focus:select-neutral"
              onChange={(e) => setCategory(parseInt(e.target.value))}
            >
              {contributionCategories.map((category, index) => (
                <option key={category} value={index}>
                  {category}
                </option>
              ))}
            </select>
            <label htmlFor="contribution-create-title" className="label font-semibold">
              <span className="label-text text-accent-content">Title</span>
            </label>
            <input
              id="contribution-create-title"
              className="mb-4 input input-bordered w-full max-w-lg focus:input-neutral"
              onChange={(e) => setTitle(e.target.value)}
            />
            <label htmlFor="contribution-create-url" className="label font-semibold">
              <span className="label-text text-accent-content">URL</span>
            </label>
            <input
              id="contribution-create-url"
              className="input input-bordered w-full max-w-lg focus:input-neutral mb-5"
              onChange={(e) => setUrl(e.target.value)}
            />
            <button className="btn btn-accent text-neutral" onClick={(e) => handlePost(e)}>
              Post
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
