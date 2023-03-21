import { ReactEventHandler, useEffect, useRef, useState } from "react";
import axios, { Axios, AxiosError, AxiosResponse } from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useRouter } from "next/router";
import Link from "next/link";
import { NextPage } from "next";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingSpinner from "@/components/Spinner/LoadingSpinner";

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
  };
};

type ReplyState = {
  messageId: number;
  message: string;
  replyMsg: string;
};

type MutationFnParams = {
  messageId: number;
  replyMsg: string;
};

type ReplyApiResponse = {
  success: boolean;
  reply: {
    createdAt: string;
    id: number;
    message_id: string;
    reply: string;
    updatedAt: string;
  };
};

type DeleteApiResponse = {
  success: boolean;
  deletedCount: number;
};

const Profile: NextPage = () => {
  const [hasUsername, setHasUsername] = useState(true);
  const router = useRouter();

  const [reply, setReply] = useState<ReplyState>();

  const backdropRef = useRef<HTMLDivElement | null>(null);

  const queryClient = useQueryClient();

  const [replyErrMsg, setReplyErrMsg] = useState("");
  const [errMsg, setErrMsg] = useState("");

  const [willDeleteMessage, setWillDeleteMessage] = useState<{ id: number; message: string }>();

  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery<Profile, AxiosError>({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await axios.get<Profile>("http://localhost:5000/api/v1/profile", {
        withCredentials: true,
        params: { message: "include" },
      });
      const data = response.data;
      return data;
    },
    onSuccess: (profile) => {
      if (!profile?.user.username) {
        setHasUsername(false);
      }
    },

    onError: (err) => {
      if (err.request.status === 401) {
        router.push("/login");
      } else {
        setErrMsg("Something went wrong please try again later");
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });

  const {
    data,
    isLoading: isReplyLoading,
    error,
    isError: isReplyError,
    mutate: sendReply,
  } = useMutation<ReplyApiResponse, any, MutationFnParams>({
    mutationFn: async (data: MutationFnParams) => {
      const response = await axios.post<ReplyApiResponse>(`http://localhost:5000/api/v1/reply/${data.messageId}`, { reply: data.replyMsg }, { withCredentials: true });
      return response.data;
    },

    onSuccess: (data) => {
      toast.success("Reply sent !", {
        position: toast.POSITION.TOP_CENTER,
      });
      console.log(data);
      queryClient.setQueryData<Profile | undefined>(["profile"], (oldProfile) => {
        if (oldProfile) {
          const messages = oldProfile.user.messages;
          console.log(messages, data.reply.message_id);
          const msgIndex = messages.findIndex((message) => {
            return message.id.toString() === data.reply.message_id;
          });
          console.log(msgIndex);
          const temp = messages[msgIndex];

          temp.replies.push({ reply_id: data.reply.id, reply: data.reply.reply });

          // oldProfile.user.messages[msgIndex] = temp;

          console.log(oldProfile);
          setReply(undefined);
          return oldProfile;
        }

        return undefined;
      });
    },

    onError: (err) => {
      if (err?.request?.status === 401) {
        return router.push("/login");
      }

      let errorMsg = "";
      if (err?.request?.status === 400) {
        // setReplyerrMsg("Can't reply message more than 5 times");
        errorMsg = "Can't reply message more than 5 times";
      } else {
        errorMsg = "Something went wrong please try again later";
      }
      toast.error(errorMsg, {
        position: toast.POSITION.TOP_CENTER,
      });
    },
  });

  const {
    data: deleteResponse,
    isLoading: isDeleteLoading,
    mutate: deleteMessage,
  } = useMutation<DeleteApiResponse, AxiosError, number>({
    mutationFn: async (id) => {
      const response = await axios.delete<DeleteApiResponse>(`http://localhost:5000/api/v1/message/${id}`, { withCredentials: true });
      const data = response.data;
      return data;
    },
    onSuccess: (data, messageId) => {
      queryClient.setQueryData<Profile | undefined>(["profile"], (prevProfile) => {
        if (prevProfile) {
          const tempMessages = prevProfile.user.messages.filter((message) => {
            return message.id !== messageId;
          });

          const newProfile = {
            user: {
              ...prevProfile.user,
              messages: tempMessages,
            },
          };

          // console.log(newProfile);
          return newProfile;
        }
        return undefined; // By default also returns undefined
      });

      setWillDeleteMessage(undefined);
      toast.success("Message deleted", {
        position: toast.POSITION.TOP_CENTER,
      });
    },

    onError: (err) => {
      toast.error("Something went wrong, please try again later", {
        position: toast.POSITION.TOP_CENTER,
      });
    },
  });

  const handleReplyClick = (e: React.MouseEvent<HTMLButtonElement>, data: ReplyState) => {
    setReply(data);
    setReplyErrMsg("");
  };

  const handleReplyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setReplyErrMsg("");
    if (reply) {
      setReply({
        ...reply,
        replyMsg: e.target.value,
      });
    }
  };

  if (isLoading) {
    return (
      <div>
        <LoadingSpinner color="black" />
      </div>
    );
  }

  if (errMsg) {
    return <div>{errMsg}</div>;
  }
  if (!hasUsername) {
    return (
      <div>
        <span>To generate your link please update your profile</span>
        <Link href="/edit/profile">edit profile</Link>
      </div>
    );
  }

  if (!isError) {
    return (
      <>
        <div className="bg-white p-6 text-center rounded-md flex flex-col items-center gap-2">
          <h2 className="text-5xl font-bold">{profile?.user.username}</h2>

          <p className="text-2xl">Share your link</p>
          <Link
            href={`/${profile?.user.username}`}
            className="text-3xl text-red-500"
          >
            {"https://domain/" + profile?.user.username}
          </Link>

          <Link
            href="/edit/profile"
            className="px-6 py-1 w-fit text-white rounded-full block bg-blue-400"
          >
            edit profile
          </Link>
        </div>

        <div className="flex-col gap-4 flex mt-4">
          {profile?.user.messages.map((message) => {
            return (
              <div
                key={message.id}
                className="bg-white p-6 rounded-md"
              >
                <div className="flex justify-between">
                  <div
                    key={message.id}
                    className="border-l-2 border-slate-400 pl-3"
                  >
                    {message.message}
                  </div>

                  <button
                    onClick={(e) => {
                      setWillDeleteMessage({ id: message.id, message: message.message });
                      // deleteMessage(message.id);
                    }}
                  >
                    <svg
                      width="24"
                      height="24"
                      xmlns="http://www.w3.org/2000/svg"
                      fillRule="evenodd"
                      clipRule="evenodd"
                      fill="black"
                      className="scale-75"
                    >
                      <path d="M9 3h6v-1.75c0-.066-.026-.13-.073-.177-.047-.047-.111-.073-.177-.073h-5.5c-.066 0-.13.026-.177.073-.047.047-.073.111-.073.177v1.75zm11 1h-16v18c0 .552.448 1 1 1h14c.552 0 1-.448 1-1v-18zm-10 3.5c0-.276-.224-.5-.5-.5s-.5.224-.5.5v12c0 .276.224.5.5.5s.5-.224.5-.5v-12zm5 0c0-.276-.224-.5-.5-.5s-.5.224-.5.5v12c0 .276.224.5.5.5s.5-.224.5-.5v-12zm8-4.5v1h-2v18c0 1.105-.895 2-2 2h-14c-1.105 0-2-.895-2-2v-18h-2v-1h7v-2c0-.552.448-1 1-1h6c.552 0 1 .448 1 1v2h7z" />
                    </svg>
                  </button>
                </div>

                <div className="my-2">
                  {message.replies.map((reply) => {
                    return (
                      <div
                        key={reply.reply_id}
                        className=""
                      >
                        {reply.reply}
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={(e) => {
                    handleReplyClick(e, { messageId: message.id, message: message.message, replyMsg: "" });
                  }}
                  className="text-slate-700 text-sm"
                >
                  {/* <svg
                    aria-label="Comment"
                    color="gray"
                    fill="black"
                    height="24"
                    role="img"
                    viewBox="0 0 24 24"
                    width="24"
                  >
                    <title>Comment</title>
                    <path
                      d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615L22 22Z"
                      fill="none"
                      stroke="currentColor"
                      strokeLinejoin="round"
                      strokeWidth="2"
                    ></path>
                  </svg> */}
                  Reply
                </button>
              </div>
            );
          })}
        </div>

        {reply ? (
          <>
            <div
              onClick={(e) => {
                setReply(undefined);
              }}
              ref={backdropRef}
              className="top-0 left-0 h-screen w-full fixed bg-slate-500 opacity-50"
            ></div>

            <div className="top-1/2 left-1/2 fixed bg-white rounded-md -translate-x-1/2 -translate-y-1/2 p-6 w-1/2">
              <div className="border-l-2 border-slate-400 pl-3">{reply.message}</div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (reply.replyMsg.length > 255) {
                    setReplyErrMsg("Cannot exceed more than 255 characters");
                  } else if (!reply.replyMsg) {
                    toast.error("Reply message can't be empty", {
                      position: toast.POSITION.TOP_CENTER,
                    });
                  } else {
                    sendReply({ messageId: reply.messageId, replyMsg: reply.replyMsg });
                  }
                }}
              >
                <input
                  type="text"
                  placeholder="Reply something here"
                  value={reply.replyMsg}
                  className="w-full h-[30vh] bg-slate-100 rounded-md px-6 mt-4"
                  onChange={(e) => {
                    handleReplyChange(e);
                  }}
                />
                <div className="w-full flex justify-end">
                  <button
                    type="submit"
                    className="btn bg-blue-400 text-white 
                    mt-2"
                  >
                    {isReplyLoading ? (
                      <LoadingSpinner
                        height="h-6"
                        width="w-6"
                        color="white"
                      />
                    ) : (
                      "Save"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : null}

        {willDeleteMessage ? (
          <>
            <div
              onClick={(e) => {
                setWillDeleteMessage(undefined);
              }}
              ref={backdropRef}
              className="top-0 left-0 h-screen w-full fixed bg-slate-500 opacity-50"
            ></div>

            <div className="top-1/2 left-1/2 fixed bg-white rounded-md -translate-x-1/2 -translate-y-1/2 pb-6 w-2/3 max-w-md">
              <h4 className="font-bold px-6 my-4">Delete confirmation</h4>

              <div className="px-6 py-4 border-y-[1px] border-slate-200 my-2">
                <div className="border-l-2 border-slate-400 pl-3">{willDeleteMessage.message}</div>
                <p>Are you sure to delete this message ? </p>
              </div>
              <div className="flex justify-end px-6 gap-2">
                <button
                  className="bg-slate-500 text-white px-3 py-1 rounded-md"
                  onClick={() => {
                    setWillDeleteMessage(undefined);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="bg-red-500 text-white px-6 py-2 rounded-md"
                  onClick={() => {
                    deleteMessage(willDeleteMessage.id);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </>
        ) : null}
      </>
    );
  }

  return null;
};

export default Profile;
