import type { NextPage } from "next";
import { useQuery } from "@apollo/client";
import { ContributionInterface, ContributionVotesInterface } from "../interfaces/contribution";
import { createContext, useContext, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import {
  GET_CONTRIBUTIONS,
  GET_USER_UPVOTED_CONTRIBUTIONS,
  GET_USER_DOWNVOTED_CONTRIBUTIONS,
} from "../constants/subgraphQueries";
import CreateContribution from "../components/contribution/modals/CreateContribution";
import Head from "next/head";
import Contribution from "../components/contribution/Contribution";

const VoteEventsContext = createContext<{ upvoted: Number[]; downvoted: Number[] }>({ upvoted: [], downvoted: [] });

const Home: NextPage = () => {
  const [upvotedEventContributionIds, setUpvotedEventContributionIds] = useState<Number[]>([]);
  const [downvotedEventContributionIds, setDownvotedEventContributionIds] = useState<Number[]>([]);
  const { address } = useAccount();

  const {
    loading: loadingContributions,
    error: errorContributions,
    data: activeContributions,
    variables: queryPaginationOptions,
    refetch,
    startPolling: startPollContributions,
    stopPolling: stopPollContributions,
  } = useQuery(GET_CONTRIBUTIONS, {
    variables: {
      first: 5,
      skip: 0,
      todayTimestamp: new Date().setUTCHours(0, 0, 0, 0) / 1000,
      tomorrowTimestamp: new Date().setUTCHours(24, 0, 0, 0) / 1000,
    },
  });
  const { data: userUpvotedContributions, startPolling: startPollUpvotes } = useQuery(GET_USER_UPVOTED_CONTRIBUTIONS, {
    variables: {
      address: address ?? "",
    },
  });
  const { data: userDownvotedContributions, startPolling: startPollDownvotes } = useQuery(
    GET_USER_DOWNVOTED_CONTRIBUTIONS,
    {
      variables: {
        address: address ?? "",
      },
    }
  );

  startPollUpvotes(parseInt(process.env.NEXT_PUBLIC_POLL_UPVOTES!));
  startPollDownvotes(parseInt(process.env.NEXT_PUBLIC_POLL_DOWNVOTES!));
  startPollContributions(parseInt(process.env.NEXT_PUBLIC_POLL_CONTRIBUTIONS!));

  useEffect(() => {
    if (userUpvotedContributions) {
      setUpvotedEventContributionIds(
        userUpvotedContributions.contributionUpvoteds.map(
          (contribution: ContributionVotesInterface) => contribution.contributionId
        )
      );
    }
    if (userDownvotedContributions) {
      setDownvotedEventContributionIds(
        userDownvotedContributions.contributionDownvoteds.map(
          (contribution: ContributionVotesInterface) => contribution.contributionId
        )
      );
    }
  }, [userUpvotedContributions, userDownvotedContributions]);

  const handlePagination = () => {
    stopPollContributions();
    refetch({
      first: queryPaginationOptions ? queryPaginationOptions.first + 5 : 5,
    });
    startPollContributions(1000);
  };

  return (
    <div>
      <Head>
        <title>AmpliFrens</title>
        <meta
          name="description"
          content="Latest crypto news by frens for frens. Earn special perks and amplify your network."
        />
        <link rel="icon" href="/favicon.svg" />
      </Head>

      {loadingContributions ? (
        <div className="container mt-8 lg:mt-10 text-center text-accent">Loading...</div>
      ) : errorContributions ? (
        <div className="container mt-8 lg:mt-10 text-center text-accent">
          There was an error.
          <br /> Please reach out on Discord or Twitter.
        </div>
      ) : (
        <main className="container mt-8 lg:mt-10">
          {activeContributions?.contributions?.length > 0 && (
            <div className="flex justify-center">
              <CreateContribution />
            </div>
          )}
          <div className="flex justify-center">
            <h2 className="text-xl text-primary lg:text-3xl mt-12 ">
              {activeContributions?.contributions?.length === 0 ? "Contribute" : "Contributions of the day"}
            </h2>
          </div>
          {activeContributions?.contributions?.length === 0 && (
            <>
              <div className="mt-8 flex justify-center"> No contributions for today (yet). Post one anon !</div>
              <div className="flex justify-center mt-4">
                <CreateContribution />
              </div>
            </>
          )}
          {activeContributions.contributions.map((activeContribution: ContributionInterface) => {
            return (
              <VoteEventsContext.Provider
                key={activeContribution.timestamp}
                value={{ upvoted: upvotedEventContributionIds, downvoted: downvotedEventContributionIds }}
              >
                <Contribution contribution={activeContribution} hasVoteActions={true} />
              </VoteEventsContext.Provider>
            );
          })}
          <div className="flex justify-center">
            {activeContributions?.contributions?.length !== 0 && activeContributions.contributions.length % 5 === 0 && (
              <button className="btn btn-accent mb-5" onClick={handlePagination}>
                More
              </button>
            )}
          </div>
        </main>
      )}
    </div>
  );
};

export default Home;
export const useVoteContext = () => useContext(VoteEventsContext);
