import axios, { AxiosError } from "axios";
import { GetServerSideProps, NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "react-query";

type Message = {
  id: number;
  message: string;
  replies: Reply[];
};

type Reply = {
  reply_id: number;
  reply: string;
};

type Profile = {
  user: {
    id: string;
    username: string;
    messages: Message[];
  } | null;
};

type MessagePageProps = Profile;

type SendMessageApiResponse = {
  success: boolean;
  msg: {
    id: number;
    message: string;
    replies: Reply[];
  };
};

const MessagePage: NextPage<MessagePageProps> = (data) => {
  const [profile, setProfile] = useState<Profile>(data);
  const [sendMsgErr, setSendMsgErr] = useState("");

  const { mutate: sendMessage } = useMutation<SendMessageApiResponse, AxiosError, string>({
    mutationFn: async (id) => {
      const response = await axios.post<SendMessageApiResponse>(`http://localhost:5000/api/v1/message/${id}`, { message });
      const data = response.data;
      return data;
    },

    onSuccess: (data) => {
      console.log(profile);
      console.log(data);

      if (profile.user) {
        const tempMessages = [...profile.user.messages];

        tempMessages.unshift(data.msg);
        // console.log(tempMessages);

        console.log({
          user: {
            ...profile.user,
            messages: tempMessages,
          },
        });
        setProfile({
          user: {
            ...profile.user,
            messages: tempMessages,
          },
        });

        setMessage("");
      }
    },

    onError: (err) => {
      setSendMsgErr("Something went wrong please try again later");
    },
  });

  const [message, setMessage] = useState("");
  if (!profile.user) {
    return <div>Cannot found user</div>;
  }

  const messageOnChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSendMsgErr("");
    setMessage(e.target.value);
  };

  return (
    <>
      <div>
        <p>{profile?.user?.username}</p>
        <p>{profile?.user?.id}</p>

        <input
          type="text"
          value={message}
          onChange={(e) => {
            messageOnChangeHandler(e);
          }}
        />
        <button
          onClick={() => {
            if (profile.user) {
              sendMessage(profile.user.id);
            }
          }}
        >
          SEND
        </button>
        <span>{sendMsgErr}</span>
        <div>
          {profile?.user?.messages.map((message) => {
            return (
              <div key={message.id}>
                <h2 key={message.id}>{message.message}</h2>

                {message.replies.map((reply) => {
                  return (
                    <div
                      key={reply.reply_id}
                      style={{ marginLeft: "10px", display: "flex", gap: "20px" }}
                    >
                      <h3>{reply.reply}</h3>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps<MessagePageProps> = async (context) => {
  const { name } = context.query;

  const response = await axios.get<Profile>(`http://localhost:5000/api/v1/message/${name}`);
  const data = response.data;
  return {
    props: data,
  };
};

export default MessagePage;
