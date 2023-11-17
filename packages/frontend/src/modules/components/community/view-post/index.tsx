import { useEffect, useRef, useState } from "react";

import { usePostsData } from "../../../common/context/community-context";
import { defaultAvatar } from "../../../common/consts/avatar";
import { useUserData } from "../../../common/context/user-context";
import { useAddCommentToPost, useAddLikeToPost } from "../../../common/services/community.service";
import { useGetUserById } from "../../../common/services/user.service";
import { IUser } from "../../../common/types/User";
import { PostImage, ImageBlock, InfoBlock, MainContainer, AuthorBlock, AuthorAvatar, AuthorName, PostText, ClosePost, Cross, LikesCount, ThumbsUpIcon, LikeButton, DislikeButton, CommentsBlock, MyComment, Comment, CommentNickname, CommentText, PostCommentWrap, PostCommentButton } from "./index.styled";
import { IComment, IPost } from "../../../common/types/Post.interface";
import { useHistory } from "react-router-dom";
import { APP_KEYS } from "../../../common/consts";

export const ViewPost = ({ post, user, setSelectedPost, setSelectedUser }: any) => {
  const { postsData, setPostsData, likedPosts, setLikedPosts } = usePostsData();
  const [userInfo, setUserInfo] = useState<IUser | null>(null);
  const [userLiked, setUserLiked] = useState<boolean>(false);
  const [commentText, setCommentText] = useState('');
  const [commentUsers, setCommentUsers] = useState<IUser[]>([]);
  const UserDataProvider = useUserData();
  const history = useHistory()
  const getUserByIdMutation = useGetUserById();
  const addLikeMutation = useAddLikeToPost()
  const addCommentMutation = useAddCommentToPost();

  const imageRef = useRef<HTMLImageElement>(null);
  const infoBlockRef = useRef<HTMLDivElement>(null);
  const imageBlockRef = useRef<HTMLDivElement>(null);


  const handleAddComment = async (
    postId: string,
    userId: string,
    commentText: string
  ) => {
    if (UserDataProvider?.userData?._id) {
      try {
        await addCommentMutation.mutateAsync({
          postId,
          userId,
          text: commentText,
        });

        const newComment = {
          user: UserDataProvider.userData._id,
          text: commentText,
        };

        const updatedPostsData = postsData.map((p: IPost) =>
          p._id === postId
            ? {
                ...p,
                comments: [...p.comments, newComment],
              }
            : p
        );
        setPostsData(updatedPostsData);

        setCommentText("");

        const user = await getUserByIdMutation.mutateAsync(
          UserDataProvider.userData._id
        );
        if (user) {
          setCommentUsers([...commentUsers, user]);
        }
      } catch (error: any) {
        console.error("Error adding comment:", error.message);
      }
    }
  };

  useEffect(() => {
    const fetchCommentUsers = async () => {
      const usersPromises = post.comments.map((comment: IComment) =>
        getUserByIdMutation.mutateAsync(comment.user)
      );

      if (usersPromises.length > 0) {
        const resolvedUsers = await Promise.all(usersPromises);
        setCommentUsers(resolvedUsers);
      }
    };

    fetchCommentUsers();
    }, [post.comments]);

  useEffect(() => {
    if (imageRef.current && infoBlockRef.current && imageBlockRef.current) {
      const imageHeight = imageRef.current.clientHeight;
      infoBlockRef.current.style.height = `${imageHeight}px`;
      imageBlockRef.current.style.height = `${imageHeight}px`;
    }
  }, []);

  useEffect(() => {
    setUserLiked(likedPosts.includes(post._id));
  }, [likedPosts, post._id]);

  const handleMainContainerClick = (e: any) => {
    const clickedElement = e.target;
    if (
      clickedElement.closest(".InfoBlock") ||
      clickedElement.closest(".ImageBlock")
    ) {
      return;
    }

    setSelectedPost(null);
    setSelectedUser(null);
  };

  useEffect(() => {
    let isMounted = true;

    const fetchUser = async () => {
      const user = await getUserByIdMutation.mutateAsync(post.user);
      if (isMounted && user) {
        setUserInfo(user);
      }
    };

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, [post.user]);

  const handleLikeClick = async (postId: string) => {
    if (!userLiked) {
      if (UserDataProvider?.userData?._id) {
        try {
          await addLikeMutation.mutateAsync({
            postId,
            userId: UserDataProvider.userData._id,
          });
          setUserLiked(true);

          const updatedLikedPosts = [...likedPosts, post._id];
          setLikedPosts(updatedLikedPosts);

          const updatedPostsData = postsData.map((p: IPost) =>
            p._id === post._id && UserDataProvider?.userData?._id
              ? {
                  ...p,
                  likes: {
                    ...p.likes,
                    count: p.likes.count + 1,
                    users: [...p.likes.users, UserDataProvider.userData._id],
                  },
                }
              : p
          );
          setPostsData(updatedPostsData);
        } catch (error) {
          console.error("Error occurred while adding like:", error);
        }
      }
    }
  };

  const handleCommentTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setCommentText(newText);
  };

  return (
    <MainContainer onClick={handleMainContainerClick}>
      <ImageBlock className="ImageBlock" ref={imageBlockRef}>
        <PostImage ref={imageRef} src={post.image} />
      </ImageBlock>
      <InfoBlock className="InfoBlock" ref={infoBlockRef}>
        <ClosePost>
          <Cross
            onClick={() => {
              setSelectedPost(null);
              setSelectedUser(null);
            }}
            src="https://res.cloudinary.com/didkbrlcz/image/upload/v1699858461/cross-svgrepo-com_1_n9mllx.svg"
          />
        </ClosePost>
        <AuthorBlock>
          <AuthorAvatar
            onClick={() =>
              history.push(
                "/" + APP_KEYS.ROUTER_KEYS.PROFILE + "/" + userInfo?._id
              )
            }
            src={userInfo?.avatar || defaultAvatar}
          />
          <AuthorName
            onClick={() =>
              history.push(
                "/" + APP_KEYS.ROUTER_KEYS.PROFILE + "/" + userInfo?._id
              )
            }
          >
            {userInfo?.name}
          </AuthorName>
        </AuthorBlock>
        <PostText>{post.title}</PostText>
        <PostText>{post.description}</PostText>
        <LikesCount>
          <ThumbsUpIcon src="https://community.cloudflare.steamstatic.com/public/images/sharedfiles/icons/icon_rate.png" />
          {postsData.find((p: IPost) => p._id === post._id)?.likes.count || 0}
        </LikesCount>
        <div style={{ display: "flex", margin: "0.5rem 0 0 0.5rem" }}>
          <LikeButton
            style={userLiked ? { backgroundPosition: "8px -60px" } : {}}
            onClick={() => handleLikeClick(post._id)}
          />
          <DislikeButton />
        </div>
        <CommentsBlock>
          <Comment style={{ margin: 0 }}>
            <AuthorAvatar
              onClick={() =>
                history.push(
                  "/" +
                    APP_KEYS.ROUTER_KEYS.PROFILE +
                    "/" +
                    UserDataProvider?.userData?._id
                )
              }
              src={UserDataProvider?.userData?.avatar || defaultAvatar}
            />
            <MyComment
              onChange={handleCommentTextChange}
              placeholder="Add a comment"
            />
          </Comment>
          {commentText && UserDataProvider?.userData?._id && (
            <PostCommentWrap>
              <PostCommentButton
                onClick={() =>
                  handleAddComment(
                    post._id,
                    UserDataProvider?.userData?._id || "",
                    commentText
                  )
                }
              >
                Post Comment
              </PostCommentButton>
            </PostCommentWrap>
          )}
          {postsData
            .find((p: IPost) => p._id === post._id)
            ?.comments.map((comment: IComment, index: number) => (
              <Comment key={index}>
                <AuthorAvatar
                  onClick={() =>
                    history.push(
                      "/" + APP_KEYS.ROUTER_KEYS.PROFILE + "/" + comment.user
                    )
                  }
                  src={commentUsers[index]?.avatar || defaultAvatar}
                />
                <div style={{ marginLeft: "0.75rem" }}>
                  <CommentNickname
                    onClick={() =>
                      history.push(
                        "/" + APP_KEYS.ROUTER_KEYS.PROFILE + "/" + comment.user
                      )
                    }
                  >
                    {commentUsers[index]?.name || "Unknown"}
                  </CommentNickname>
                  <CommentText>{comment.text}</CommentText>
                </div>
              </Comment>
            ))
            .reverse()}
        </CommentsBlock>
      </InfoBlock>
    </MainContainer>
  );
};