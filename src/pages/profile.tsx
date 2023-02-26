import { ReactEventHandler, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useRouter } from "next/router";
import Link from "next/link";

type Message = {
  id: string;
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
  messageId: string;
  message: string;
  replyMsg: string;
};

type MutationFnParams = {
  messageId: string;
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

const Profile = () => {
  const [hasUsername, setHasUsername] = useState(true);
  const router = useRouter();

  const [reply, setReply] = useState<ReplyState>();

  const backdropRef = useRef<HTMLDivElement | null>(null);

  const queryClient = useQueryClient();

  const [replyErrMsg, setReplyErrMsg] = useState("");

  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery<Profile, any>({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await axios.get("http://localhost:5000/api/v1/profile", { withCredentials: true });
      const data = response.data as Profile;
      return data;
    },
    onSuccess: (profile) => {
      console.log(profile);
      if (!profile?.user.username) {
        setHasUsername(false);
      }
    },

    onError: (err) => {
      console.log(err?.request?.status);
      if (err?.request?.status === 401) {
        router.push("/login");
      }
      console.log(err);
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
      const response = await axios.post(`http://localhost:5000/api/v1/reply/${data.messageId}`, { reply: data.replyMsg }, { withCredentials: true });
      return response.data;
    },

    onSuccess: (data) => {
      console.log(data);
      queryClient.setQueryData<Profile | undefined>(["profile"], (oldProfile) => {
        if (oldProfile) {
          const messages = oldProfile.user.messages;
          console.log(messages, data.reply.message_id);
          const msgIndex = messages.findIndex((message) => {
            return message.id == data.reply.message_id;
          });
          console.log(msgIndex);
          const temp = messages[msgIndex];

          temp.replies.push({ reply_id: data.reply.id, reply: data.reply.reply });

          // oldProfile.user.messages[msgIndex] = temp;

          console.log(oldProfile);
          return oldProfile;
        }

        return undefined;
      });
    },

    onError: (err) => {
      if (err?.request?.status === 400) {
        setReplyErrMsg("Can't reply message more than 5 times");
      } else if (err?.reguest.status === 401) {
        router.push("/login");
      } else {
        setReplyErrMsg("Something went wrong please try again later");
      }
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
    return <div>LOADING ....</div>;
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
        <div style={{ maxWidth: "768px", backgroundColor: "salmon", margin: "auto" }}>
          <Link href="/">sdfsf</Link>
          <p>{profile?.user.username}</p>
          <p>{profile?.user.id}</p>
          <Link href="/edit/profile">edit profile</Link>
          <p>Share your link</p>
          <p>{"https://domain/" + profile?.user.username}</p>
          <div>
            {profile?.user.messages.map((message) => {
              return (
                <div key={message.id}>
                  <h2 key={message.id}>{message.message}</h2>
                  <button
                    onClick={(e) => {
                      handleReplyClick(e, { messageId: message.id, message: message.message, replyMsg: "" });
                    }}
                  >
                    Reply
                  </button>
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

          {reply ? (
            <>
              <div
                onClick={(e) => {
                  setReply(undefined);
                }}
                ref={backdropRef}
                style={{ position: "absolute", backgroundColor: "black", top: "0", left: "0", bottom: "0", right: "0", opacity: "0.5" }}
                className="reply-backdrop"
              ></div>

              <div style={{ position: "absolute", top: "0", left: "0", backgroundColor: "black" }}>
                <h2 style={{ fontSize: "20px", color: "white", textAlign: "center" }}>{reply.message}</h2>
                <input
                  type="text"
                  placeholder="Reply something here"
                  value={reply.replyMsg}
                  style={{ backgroundColor: "white", width: "300px", height: "100px", margin: "auto", display: "block" }}
                  onChange={(e) => {
                    handleReplyChange(e);
                  }}
                />

                <button
                  onClick={() => {
                    console.log(reply.replyMsg.length);
                    if (reply.replyMsg.length > 255) {
                      setReplyErrMsg("Cannot exceed more than 255 characters");
                    } else {
                      sendReply({ messageId: reply.messageId, replyMsg: reply.replyMsg });
                    }

                    // setReply(undefined);
                  }}
                >
                  Save
                </button>

                <h1 style={{ color: "white" }}>{replyErrMsg}</h1>
              </div>
            </>
          ) : null}
        </div>
      </>
    );
  }
};

export default Profile;
