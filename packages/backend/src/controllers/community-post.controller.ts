import { Request, Response } from "express";
import { CommunityPostService } from "../services/community-post.service";

export class CommunityPostController {
  constructor(private postService: CommunityPostService) {}

  async createPost(req: Request, res: Response) {
    const { postData } = req.body;

    try {
      const post = await this.postService.createPost(postData);
      res.status(200).json(post);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updatePost(req: Request, res: Response) {
    const { postData, userId } = req.body;

    try {
      const post = await this.postService.updatePost(postData, userId);
      res.status(200).json(post);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deletePost(req: Request, res: Response) {
    const { userId, postId } = req.body;

    try {
      const post = await this.postService.deletePost(postId, userId);
      res.status(200).json({ message: 'Post successfully deleted' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

const communityPostController = new CommunityPostController(new CommunityPostService());
export default communityPostController;