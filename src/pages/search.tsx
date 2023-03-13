import { useRouter } from "next/router";
import { GetServerSideProps, NextPage } from "next";
import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";

type User = {
  id: string;
  username: string;
  createdAt: string;
  updatedAt: string;
};
type SearchProps = {
  users: User[];
};

const Search: NextPage<SearchProps> = ({ users }) => {
  const router = useRouter();

  const [username, setUsername] = useState("");
  useEffect(() => {
    if (router.isReady) {
      const { q } = router.query;
      if (q) {
        setUsername(q as string);
        if (usersData.length === 0) {
          setSearchMsg("Cannot found user");
        }
      }
    }
  }, [router.isReady]);

  const { q } = router.query;
  const [isNotFound, setIsNotFound] = useState(false);
  const [searchMsg, setSearchMsg] = useState("Find people here");

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const [usersData, setUsersData] = useState(users);

  const onSubmitHandler = async () => {
    setIsNotFound(false);
    setSearchMsg("");
    const response = await axios.get<SearchProps>("http://localhost:5000/api/v1/users", { params: { q: username } });
    const data = response.data;

    if (data.users.length === 0) {
      setSearchMsg("Cannot found user");
      setIsNotFound(true);
    }
    setUsersData(data.users);
    router.push(`/search?q=${username}`, undefined, { shallow: true });
  };

  return (
    <>
      <div className="bg-white p-6 rounded-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmitHandler();
          }}
          className="flex justify-center gap-2 items-center w-full"
        >
          <input
            type="text"
            value={username}
            onChange={(e) => {
              onChangeHandler(e);
            }}
            className="bg-slate-200 rounded-sm px-2 py-1 w-1/2"
            placeholder="Search"
          />
          <button
            type="submit"
            className="bg-orange-400 px-5 py-1 rounded-full text-white"
          >
            submit
          </button>
        </form>

        {searchMsg ? <div className={`text-center mt-4 ${isNotFound ? "text-red-400" : ""}`}>{searchMsg}</div> : null}
      </div>

      <ul className="max-w-3xl mx-auto flex flex-col mt-4 gap-2">
        {usersData.map((user) => {
          return (
            <li
              key={user.id}
              className="flex justify-between bg-white p-6 rounded-md"
            >
              <p>{user.username}</p>
              <Link
                href={`/${user.username}`}
                className=""
              >
                Send message
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<SearchProps> = async (context) => {
  const { q } = context.query;
  const response = await axios.get<SearchProps>("http://localhost:5000/api/v1/users", { params: { q } });
  const data = response.data;
  return {
    props: data,
  };
};

export default Search;
