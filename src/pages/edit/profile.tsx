import LoadingSpinner from "@/components/Spinner/LoadingSpinner";
import axios, { AxiosError } from "axios";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { toast } from "react-toastify";

type ProfileType = {
  user: {
    id: string;
    username: string | null;
    createdAt: string;
    updatedAt: string;
    instagram: string | null;
    twitter: string | null;
  };
};

type ProfileState = { username: string; instagram: string; twitter: string };

const EditProfile: NextPage = () => {
  const a: ProfileState = {} as ProfileState;
  const router = useRouter();
  const queryClient = useQueryClient();
  // const [profile, setProfile] = useState<ProfileType | undefined>(() => {
  //   return queryClient.getQueryData<ProfileType>(["edit", "profile"]);
  // });

  const [getProfileErrMsg, setGetProfileErrMsg] = useState("");
  const [updateProfileErrMsg, setUpdateProfileErrMsg] = useState("");

  const [controlledProfile, setControlledProfile] = useState<ProfileState>({
    username: "",
    instagram: "",
    twitter: "",
  });

  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery<ProfileType, any>({
    queryKey: ["edit", "profile"],
    queryFn: async () => {
      const response = await axios.get<ProfileType>("http://localhost:5000/api/v1/profile", { withCredentials: true });
      const data = response.data;
      return data;
    },
    onSuccess: (data) => {
      console.log(data);
      // setProfile(data);

      const { username, instagram, twitter } = data.user;

      setControlledProfile({
        username: username || "",
        instagram: instagram || "",
        twitter: twitter || "",
      });

      if (!data?.user.username) {
        // setHasUsername(false);
      }
    },

    onError: (err) => {
      console.log(err?.request?.status);
      if (err?.request?.status === 401) {
        router.push("/login");
      } else {
        setGetProfileErrMsg("Something went wrong please try again later");
      }
      console.log(err);
    },
    retry: false,
  });

  const {
    data: updateResponse,
    mutate: updateProfile,
    isLoading: isUpdateLoading,
  } = useMutation<any, AxiosError>({
    mutationFn: async () => {
      const response = await axios.post<{ success: boolean }>(
        "http://localhost:5000/api/v1/profile",
        {
          username: controlledProfile.username,
          instagram: controlledProfile.instagram,
          twitter: controlledProfile.twitter,
        },
        { withCredentials: true }
      );

      return response.data;
    },

    onSuccess: () => {
      toast.success("Profile updated", {
        position: toast.POSITION.TOP_CENTER,
      });
      router.push("/profile");
    },

    onError: (err) => {
      // Do something with this error...
      if (err.request.status === 400) {
        setUpdateProfileErrMsg("Name is already exist");
      } else {
        setUpdateProfileErrMsg("Something went wrong please try again later");
      }
    },
  });
  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (profile) {
      // setProfile({
      //   user: {
      //     ...profile.user,
      //     username: e.target.value,
      //   },
      // });
    }

    setControlledProfile({
      ...controlledProfile,

      [e.target.name]: e.target.value,
    });
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (getProfileErrMsg) {
    return <div>{getProfileErrMsg}</div>;
  }

  if (!isError) {
    return (
      <>
        <div className="">
          <h2 className="uppercase text-2xl sm:text-4xl mb-4">profile settings</h2>
          <form
            className="bg-white p-6"
            onSubmit={(e) => {
              e.preventDefault();
              updateProfile();
            }}
          >
            <div className="flex flex-col gap-2">
              <div className="flex-col flex gap-1">
                <label
                  htmlFor="username"
                  className="text-slate-700"
                >
                  Change name
                </label>
                <input
                  type="text"
                  placeholder="name"
                  value={controlledProfile.username}
                  onChange={(e) => {
                    onChangeHandler(e);
                  }}
                  id="username"
                  name="username"
                  className="bg-slate-200 rounded-sm px-2 py-1"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="instagram"
                  className="text-slate-700"
                >
                  Instagram
                </label>
                <input
                  type="text"
                  placeholder="instagram"
                  value={controlledProfile.instagram}
                  onChange={(e) => {
                    onChangeHandler(e);
                  }}
                  id="instagram"
                  name="instagram"
                  className="bg-slate-200 rounded-sm px-2 py-1"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="username"
                  className="text-slate-700"
                >
                  Twitter
                </label>
                <input
                  type="text"
                  placeholder="twitter"
                  value={controlledProfile.twitter}
                  onChange={(e) => {
                    onChangeHandler(e);
                  }}
                  id="twitter"
                  name="twitter"
                  className="bg-slate-200 rounded-sm px-2 py-1"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="btn bg-blue-400 mt-4"
              >
                {isUpdateLoading ? <LoadingSpinner color="white" /> : "save"}
              </button>
            </div>
          </form>

          {/* <h1>{updateProfileErrMsg}</h1> */}
        </div>
      </>
    );
  }
  return null;
};

export default EditProfile;
