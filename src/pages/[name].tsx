import LoadingSpinner from "@/components/Spinner/LoadingSpinner";
import axios, { AxiosError } from "axios";
import { GetServerSideProps, NextPage } from "next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const { mutate: sendMessage, isLoading: isSendMessageLoading } = useMutation<SendMessageApiResponse, AxiosError, string>({
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
        toast.success("Message sent !", {
          position: toast.POSITION.TOP_CENTER,
        });
      }
    },

    onError: (err) => {
      toast.error("Something went wrong !", {
        position: toast.POSITION.TOP_CENTER,
      });
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
      <div className="flex flex-col">
        <div className="p-6 rounded-md bg-white">
          <h2 className="text-5xl font-bold mb-4 text-center">{profile?.user?.username}</h2>
          <p className="text-center">Lorem ipsum dolor sit amet.</p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!message) {
                return toast.error("Message can't be empty", {
                  position: toast.POSITION.TOP_CENTER,
                });
              }
              if (profile.user) {
                sendMessage(profile.user.id);
              }
            }}
            className="p-6 rounded-md bg-white flex flex-col items-center"
          >
            <input
              type="text"
              value={message}
              onChange={(e) => {
                messageOnChangeHandler(e);
              }}
              className="bg-slate-200 px-6 h-28 w-full rounded-md focus:ring-sky-500 focus:ring-1 outline-none"
              placeholder="Send anonymous message"
              ref={inputRef}
            />
            <div className="flex justify-between mt-4 w-full">
              <span className="text-slate-600 text-sm">your message is anonymous</span>
              <button
                type="submit"
                className="bg-blue-400 btn"
              >
                {isSendMessageLoading ? <LoadingSpinner color="white" /> : "Send"}
              </button>
            </div>
          </form>
        </div>

        <span>{sendMsgErr}</span>
        <div className="flex-col gap-4 flex mt-4">
          {profile?.user?.messages.map((message) => {
            return (
              <div
                key={message.id}
                className="bg-white p-6 rounded-md"
              >
                <div
                  key={message.id}
                  className="border-l-2 border-slate-400 pl-3"
                >
                  {message.message}
                </div>

                <div className="my-2 flex flex-col gap-2">
                  {message.replies.map((reply) => {
                    return (
                      <div
                        key={reply.reply_id}
                        className="bg-slate-100 p-2 rounded-md text-slate-700"
                      >
                        {reply.reply}
                      </div>
                    );
                  })}
                </div>
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
