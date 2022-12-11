export interface BaseDTO {
  id: string;
}

export interface BlogPost extends BaseDTO {
  //id: string;
  title: string;
  text: string;
  createdAt: Date;
  updatedAt: Date;

  authorId: string;
}

export interface Author extends BaseDTO {
  //id: string;
  name: string;
}
