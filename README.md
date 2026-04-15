# MyDevBlog

A modern, high-performance blog platform featuring a decoupled architecture. This project serves as a showcase of full-stack development, featuring a dedicated administration panel, a robust RESTful API, and a sleek, fast frontend.

---

## 📂 Project Structure

The project is organized into three main directories to ensure a clean separation of concerns:

* **`frontend/`**: The client-facing blog. Built with **React** and **Tailwind CSS**.
* **`admin/`**: A private dashboard for content management (Create, Read, Update, Delete posts).
* **`backend/`**: The core API service powered by **Node.js**, **Express**, and **Prisma**.

---

## 🚀 Features

* **Authentication & Security**: Secure user/admin sessions using **JWT (JSON Web Tokens)** and **BcryptJS** for password hashing.
* **RBAC (Role-Based Access Control)**:
    * **User**: Can read published articles.
    * **Admin**: Full access to the Admin Dashboard to moderate content and manage users.
* **Dynamic Content**: Server-side post filtering (published vs. draft) and tag-based categorization.
* **Optimized Performance**: Integrated **sessionStorage** caching for posts to reduce redundant API calls and improve UX.
* **Responsive Design**: Mobile-first architecture across both the Blog and the Admin Panel.

---

## 📊 Database Design

### Users
Represents registered individuals with specific access and authorization levels.
* **`id`** (Primary Key)
* **`username`** (Unique)
* **`email`**
* **`password`**
* **`role`**: Authorization level, defaults to `USER` (e.g., `ADMIN`).
* **Relationships**: Linked to multiple `Posts` and `Comments`.

### Posts
Contains the core articles and metadata created by authors.
* **`id`** (Primary Key)
* **`title`** (Unique): The headline of the article.
* **`urlSlug`** (Unique): SEO-optimized URL identifier.
* **`description`**: The primary content body of the post.
* **`summary`**: A brief excerpt used for card previews.
* **`coverImage`**: URL path for the post's header image.
* **`status`**: Current publication state (e.g., `published`, `draft`).
* **`category`**: The primary topic/genre of the article.
* **`tags`**: An array of strings for multifaceted filtering.
* **`readMin`**: Estimated reading time in minutes.
* **`date`**: Formatted string representing publication date.

### Comments
Contains user-generated feedback linked to specific articles.
* **`id`** (Primary Key)
* **`name`**: Display name of the commenter.
* **`comment`**: The text content of the message.
* **`date`**: Timestamp of the interaction.

---

## 🛠️ Tech Stack

* **Frontend**: React.js, React Router, Tailwind CSS, Lucide Icons.
* **Admin Panel**: React.js, Shadcn/UI, Tailwind CSS, Lucide Icons
* **Backend**: Node.js, Express.js.
* **ORM**: Prisma.
* **Database**: PostgreSQL (hosted on Neon Database).
* **Utilities**: JWT.
