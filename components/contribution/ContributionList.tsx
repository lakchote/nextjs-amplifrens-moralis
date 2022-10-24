import { faThumbsUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ContributionInterface } from "../../interfaces/contribution";
import { useAccount } from "wagmi";
import UpvoteContribution from "./votes/UpvoteContribution";
import DownvoteContribution from "./votes/DownvoteContribution";
import UpdateContribution from "./modals/UpdateContribution";
import DeleteContribution from "./modals/DeleteContribution";
import contributionCategories from "../../constants/categoryMapping";

export default function ContributionList({ contribution }: { contribution: ContributionInterface }) {
  const truncateStr = (fullStr: string, strLen: number) => {
    if (fullStr.length <= strLen) return fullStr;

    const separator = "...";
    const sepLen = separator.length;
    const charsToShow = strLen - sepLen;
    const frontChars = Math.ceil(charsToShow / 2);
    const backChars = Math.floor(charsToShow / 2);

    return fullStr.slice(0, frontChars) + separator + fullStr.slice(fullStr.length - backChars);
  };
  const { address } = useAccount();

  return (
    <div className="lg:w-full mb-10">
      <div className="bg-base-200 lg:w-5/12 mx-2 mt-6 p-8 lg:mt-8 lg:p-8 rounded-lg lg:mx-auto">
        <div className="flex items-center">
          <div className="badge sm:badge-sm md:badge-md lg:badge-lg badge-default p-4 mr-3 w-20">
            {contributionCategories[contribution.category]}
          </div>
          <div className="font-bold lg:text-lg">
            <a className="hover:text-primary" href={contribution.url}>
              {contribution.title}
            </a>
            <div className="text-xs pt-1">
              <a href="#" className="font-extralight text-secondary hover:text-secondary-focus">
                by {contribution.hasProfile ? contribution.username : truncateStr(contribution.from, 15)}
              </a>
            </div>
          </div>
        </div>
        <div className="text-sm mt-4 px-6">
          <FontAwesomeIcon icon={faThumbsUp} className={contribution.votes > 0 ? "text-primary" : ""} />{" "}
          {contribution.votes}
        </div>
        <div className="divider"></div>
        <div className="flex justify-around text-sm">
          {!address || contribution.from.toUpperCase() !== address.toUpperCase() ? (
            <>
              <UpvoteContribution contributionId={contribution.contributionId} />
              <DownvoteContribution contributionId={contribution.contributionId} />
            </>
          ) : (
            <>
              <UpdateContribution contributionId={contribution.contributionId} />
              <DeleteContribution contributionId={contribution.contributionId} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
