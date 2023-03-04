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
      } else if (!q) {
        setSearchMsg("Find people here");
      }
    }
  }, [router.isReady]);

  const [searchMsg, setSearchMsg] = useState("");

  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const [usersData, setUsersData] = useState(users);

  const onClickHandler = async () => {
    setSearchMsg("");
    const response = await axios.get<SearchProps>("http://localhost:5000/api/v1/users", { params: { q: username } });
    const data = response.data;

    if (data.users.length === 0) {
      setSearchMsg("Cannot found user");
    }
    setUsersData(data.users);
    router.push(`/search?q=${username}`, undefined, { shallow: true });
  };

  return (
    <div>
      <p>Search</p>
      <input
        type="text"
        value={username}
        onChange={(e) => {
          onChangeHandler(e);
        }}
      />
      <button
        onClick={() => {
          onClickHandler();
        }}
      >
        Search
      </button>

      {searchMsg ? <div>{searchMsg}</div> : null}

      {usersData.map((user) => {
        return (
          <div key={user.id}>
            <Link
              href={`${user.username}`}
              legacyBehavior
            >
              <a>
                <h1>{user.username}</h1>
                <h2>{user.id}</h2>
              </a>
            </Link>
          </div>
        );
      })}
    </div>
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
