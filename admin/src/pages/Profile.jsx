import { Link, useNavigate } from "react-router"
import { useLocation } from "react-router"
import { useState, useEffect } from "react";

const Profile = ({user, setUser}) => {
    const navigate = useNavigate();
    const token = localStorage.getItem("jwtToken");
    const location = useLocation();
    const postSuccessMessage = location.state?.postSuccessMessage;

    // States
    const [errors, setErrors] = useState("");
    const [posts, setPosts] = useState(() => {
        const saved = sessionStorage.getItem("cachedPosts");
        return saved ? JSON.parse(saved) : [];
    });
    const [successMessage, setSuccessMessage] = useState("");
    const [isLoading, setIsLoading] = useState(() => {
        return sessionStorage.getItem("cachedPosts") ? false : true;
    });
    const [deletingId, setDeletingId] = useState(false);

    const handleLogout = async (e) => {
        e.preventDefault(e)
        const res = await fetch('/api/logout', {
            method: 'GET'
        })

        if(!res.ok) {
            throw new Error("Can't logout, please try again!")
        }
        else {
            localStorage.removeItem('jwtToken');
            setUser({auth: false, name: ''})
        }
    }

    const changeStatus = async (postId, currentStatus) => {
        const newStatus = currentStatus === "published" ? "draft" : "published";

        try {
            const res = await fetch(`/api/posts/${postId}/toggle`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({status: newStatus})

            })

            if(res.ok) {
                // Update frontend
                setPosts(prevPosts => prevPosts.map(post => 
                    post.id === postId
                        ? {...post, status: newStatus}
                        : post
                ));

                setSuccessMessage(`Success: Post is now ${newStatus.toUpperCase()}`);

                setTimeout(() => {
                    setSuccessMessage("");
                }, 3000);
            }
            else {
                setErrors("Failed to update status on the server.");
            }
        } catch(err) {
            setErrors("Network error while updating status.")
        }
    }
    
    const deletePost = async (postId) => {
        const isConfirmed = window.confirm("Are you sure you want to permanently delete this post? This cannot be undone.");
        if(!isConfirmed) return;

        try {
            setDeletingId(postId);

            const res = await fetch(`/api/${postId}/delete-post`, {
                method: 'DELETE',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            })

            const data = await res.json();

            if(!res.ok) {
                setErrors(data.message);
            }
            else {
                setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));

                const updatedCache = posts.filter(post => post.id !== postId);
                sessionStorage.setItem("cachedPosts", JSON.stringify(updatedCache));
                
                setSuccessMessage(`Success: Post has been deleted`);
                setTimeout(() => setSuccessMessage(""), 3000);
            }
        }
        catch(err) {
            setErrors("Network error while deleting post.");
        }
        finally {
            setDeletingId(null);
        }
    }

    useEffect(() => {
        const getPosts = async () => {
            try {
                const res = await fetch('/api/get-posts', {
                    method: 'GET',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                })

                const data = await res.json();

                if(!res.ok) {
                    setErrors(data.message)
                }
                else {
                    // Successfully got the data!
                    setPosts(data.posts)
                    sessionStorage.setItem("cachedPosts", JSON.stringify(data.posts));
                }
            } 
            finally {
                setIsLoading(false);
            }
        } 
        getPosts();  
    }, [token]);

    return (
        <div className="w-full min-h-screen flex flex-col">
            <nav className="w-full bg-white shadow-sm border-b border-slate-200 z-10 relative">
                <div className="flex justify-between items-center w-full max-w-6xl mx-auto px-4 pt-4">
                    
                    {/* Left Side: Navigation Links */}
                    <div className="flex gap-8 font-geist text-[#6f7279] font-semibold">
                        <Link to="/profile" className="pb-4 text-indigo-600 border-b-2 border-indigo-600">
                            Posts
                        </Link>
                        
                        <Link to="/new-post" className="pb-4 hover:text-slate-900 transition-colors">
                            New Post
                        </Link>
                        
                        <Link to="/comments" className="pb-4 hover:text-slate-900 transition-colors">
                            Comments
                        </Link>
                    </div>

                    {/* Right Side: User Info & Logout Button */}
                    <div className="flex items-center gap-6 pb-4">
                        <p className="text-md text-slate-700">
                            Welcome <strong>{user.name}</strong>
                        </p>
                        
                        <button 
                            onClick={handleLogout}
                            className="px-4 py-1.5 text-sm font-semibold text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                    
                </div>
            </nav>
            <main className="w-full flex flex-col flex-1 bg-[#f8fafc] pt-8 px-4 pb-12">

                <div className="w-full max-w-4xl mx-auto flex flex-col gap-4">
                    {errors && (
                        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm text-center font-medium">
                            {errors}
                        </div>
                    )}
                    {/* Display the success message if successful post creation */}
                    {postSuccessMessage && (
                        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm text-center font-medium">
                            {postSuccessMessage}
                        </div>
                    )}

                    {successMessage && (
                        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm text-center font-medium">
                            {successMessage}
                        </div>
                    )}

                    {/* Display posts  */}
                    {isLoading ? (
                        <div className="flex justify-center p-10">
                            <p className="text-gray-500">Loading your posts...</p>
                        </div>
                    ): (
                        <div className="flex flex-col gap-4 mt-2">
                            {posts.map(post => (
                                <div 
                                    key={post.id} 
                                    className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-gray-100 p-5 w-full transition-all hover:shadow-md"
                                >
                                    {/* Post title  */}
                                    <h3 className="text-gray-900 font-semibold text-base">
                                        {post.title}
                                    </h3>

                                    {/* Action Buttons  */}
                                    <div className="flex items-center gap-2 cursor-pointer">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={post.status === "published"}
                                                onChange={() => changeStatus(post.id, post.status)}
                                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-600 cursor-pointer"
                                            />
                                            <span className={`text-sm font-medium ${post.status === "published" ? 'text-indigo-600' : 'text-gray-400'}`}>
                                                {post.status === "published" ? "Published" : "Draft"}
                                            </span>
                                        </label>
                                        
                                        <button className="text-sm font-medium text-gray-400 hover:text-black transition-colors" onClick={() => navigate(`/${post.id}/edit-post`)}>
                                            Edit
                                        </button>
                                        
                                        <button 
                                            className="text-sm font-medium text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50" 
                                            onClick={() => deletePost(post.id)}
                                            disabled={deletingId === post.id}
                                        >
                                            {deletingId === post.id ? "Deleting..." : "Delete"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>  
            </main>
        </div>
    )
}

export default Profile