import axios from "axios";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useQuery } from "react-query";

const Test: NextPage = () => {
  const router = useRouter();
  console.log(router.query);
  const { data } = useQuery({
    queryKey: [router.query.test],
    queryFn: async () => {
      const response = await axios.get(`http://localhost:5000/api/v1/message/${router.query.test}`);
      const data = response.data;
      console.log(data);
      return {
        hi: data,
      };
    },
    refetchOnWindowFocus: false,
  });
  //@ts-ignore
  return (
    <div>
      {data?.hi?.user?.username}
      <p>{!data?.hi?.user ? "null" : "not null"}</p>
    </div>
  );
};

export default Test;
