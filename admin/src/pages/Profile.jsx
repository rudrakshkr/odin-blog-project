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
                <div className="flex flex-col sm:flex-row justify-between items-center w-full max-w-6xl mx-auto px-4 pt-4 gap-y-3">
                    
                    <div className="flex gap-5 sm:gap-8 font-geist text-sm sm:text-base text-[#6f7279] font-semibold w-full sm:w-auto justify-between sm:justify-start overflow-x-auto no-scrollbar">
                        <Link to="/profile" className="pb-3 sm:pb-4 text-indigo-600 border-b-2 border-indigo-600 whitespace-nowrap">
                            Posts
                        </Link>
                        
                        <Link to="/new-post" className="pb-3 sm:pb-4 hover:text-slate-900 transition-colors whitespace-nowrap">
                            New Post
                        </Link>
                        
                        <Link to="/comments" className="pb-3 sm:pb-4 hover:text-slate-900 transition-colors whitespace-nowrap">
                            Comments
                        </Link>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 pb-4 w-full sm:w-auto border-t sm:border-none border-slate-100 pt-3 sm:pt-0">
                        <p className="text-sm sm:text-md text-slate-700">
                            Welcome <strong>{user.name}</strong>
                        </p>
                        
                        <button 
                            onClick={handleLogout}
                            className="px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors shrink-0"
                        >
                            Logout
                        </button>
                    </div>
                    
                </div>
            </nav>

            <main className="w-full flex flex-col flex-1 bg-[#f8fafc] pt-6 sm:pt-8 px-4 pb-12">
                <div className="w-full max-w-4xl mx-auto flex flex-col gap-4">
                    
                    {errors && (
                        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm text-center font-medium">
                            {errors}
                        </div>
                    )}
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
                            <p className="text-gray-500 font-medium animate-pulse">Loading your posts...</p>
                        </div>
                    ): (
                        <div className="flex flex-col gap-4 mt-2">
                            {posts.map(post => (
                                <div 
                                    key={post.id} 
                                    className="flex flex-col sm:flex-row sm:items-center justify-between bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5 w-full transition-all hover:shadow-md gap-4 sm:gap-0"
                                >
                                    {/* Post title  */}
                                    <h3 className="text-gray-900 font-semibold text-base leading-snug pr-2">
                                        {post.title}
                                    </h3>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap items-center gap-4 sm:gap-3 shrink-0">
                                        <label className="flex items-center gap-2 cursor-pointer bg-gray-50 sm:bg-transparent px-3 py-1.5 sm:p-0 rounded-md sm:rounded-none">
                                            <input 
                                                type="checkbox" 
                                                checked={post.status === "published"}
                                                onChange={() => changeStatus(post.id, post.status)}
                                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-600 cursor-pointer"
                                            />
                                            <span className={`text-sm font-medium ${post.status === "published" ? 'text-indigo-600' : 'text-gray-500'}`}>
                                                {post.status === "published" ? "Published" : "Draft"}
                                            </span>
                                        </label>
                                        
                                        <div className="flex items-center gap-3 ml-auto sm:ml-0">
                                            <button 
                                                className="text-sm font-medium px-3 py-1.5 sm:p-0 bg-slate-50 sm:bg-transparent rounded-md text-slate-600 hover:text-slate-900 transition-colors" 
                                                onClick={() => navigate(`/${post.id}/edit-post`)}
                                            >
                                                Edit
                                            </button>
                                            
                                            <button 
                                                className="text-sm font-medium px-3 py-1.5 sm:p-0 bg-red-50 sm:bg-transparent rounded-md text-red-500 hover:text-red-700 transition-colors disabled:opacity-50" 
                                                onClick={() => deletePost(post.id)}
                                                disabled={deletingId === post.id}
                                            >
                                                {deletingId === post.id ? "Deleting..." : "Delete"}
                                            </button>
                                        </div>
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