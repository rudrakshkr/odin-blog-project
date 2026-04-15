import { useEffect, useState } from "react";
import { Link, useParams, useLocation } from "react-router";
import { ThreeDots, TailSpin } from "react-loader-spinner";
import DOMPurify from 'dompurify';
import { cn } from "@/lib/utils";

const ShowPost = ({user, setUser}) => {
    const API_URL = import.meta.env.VITE_API_BASE_URL || "";

    const token = localStorage.getItem("jwtToken");
    const {postSlug} = useParams();

    const location = useLocation();
    const preLoadedPost = location.state?.initialPostData;

    // States
    const [formData, setFormData] = useState(() => {
        const savedDraft = localStorage.getItem("postDraft");

        if(savedDraft) {
            return JSON.parse(savedDraft);
        }

        return {
            postTitle: preLoadedPost?.title ||  '', 
            postDescription: preLoadedPost?.description ||  '',
            postStatus: preLoadedPost?.status ||  '',
            postCategory: preLoadedPost?.category ||  '',
            postReadMin: preLoadedPost?.readMin ||  '',
            postTags: preLoadedPost?.tags ||  '',
            postUrl: preLoadedPost?.urlSlug ||  '',
            postSummary: preLoadedPost?.summary ||  '',
            postAuthor: '',
            postDate: preLoadedPost?.date ||  '',
            userId: null,
            postId: null,
        }
    })
    const [newComment, setNewComment] = useState(() => {
        const savedComment = localStorage.getItem(`commentDraft_${postSlug}`);
        
        if (savedComment) {
            return JSON.parse(savedComment);
        }
        
        return { name: '', comment: '' };
    });
    const [comments, setComments] = useState([]);
    const [successMessage, setSuccessMessage] = useState("");
    const [errors, setErrors] = useState('');
    const [commentError, setCommentError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isCommenting, setIsCommenting] = useState(false);
    const [toastMessage, setToastMessage] = useState("");

    useEffect(() => {
        if(toastMessage) {
            const timer = setTimeout(() => {
                setToastMessage("");
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [toastMessage]);

    useEffect(() => {
        localStorage.setItem(`commentDraft_${postSlug}`, JSON.stringify(newComment));
    }, [newComment, postSlug]);

    // Fetch comments and author
    useEffect(() => {
        const fetchEverything = async () => {
            try {
                const postRes = await fetch(`${API_URL}/api/${postSlug}/getPostBySlug`, {
                    method: 'GET',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                });

                if(!postRes.ok) throw new Error("Failed to get post.");
                const postData = await postRes.json();
                
                // Format Post Date
                let formattedPostDate = postData.post.date; 
                
                if (typeof postData.post.date === 'string' && postData.post.date.includes('/')) {
                    const [day, month, year] = postData.post.date.split('/');
                    formattedPostDate = new Date(year, month - 1, day).toLocaleDateString('en-US', {
                        month: 'long', day: 'numeric', year: 'numeric'
                    });
                }

                setFormData(prev => ({
                    ...prev,
                    postTitle: postData.post.title || '',
                    postDescription: postData.post.description || '',
                    postStatus: postData.post.status || 'draft',
                    postCategory: postData.post.category || '',
                    postReadMin: postData.post.readMin || 0,
                    postTags: postData.post.tags || '',
                    postUrl: postData.post.urlSlug || '',
                    postSummary: postData.post.summary || '',
                    postDate: formattedPostDate,
                    userId: postData.post.userId || null,
                    postId: postData.post.id || null,
                    postAuthor: prev.postAuthor || '' 
                }));

                const postId = postData.post.id;
                const userId = postData.post.userId;

                const [userRes, commentsRes] = await Promise.all([
                    userId ? fetch(`${API_URL}/api/${userId}/getUserById`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    }) : Promise.resolve(null),
                    fetch(`${API_URL}/api/post/${postId}/getComments`)
                ]);

                // Get Author
                if (userRes && userRes.ok) {
                    const userData = await userRes.json();
                    setFormData(prev => ({ ...prev, postAuthor: userData.user.username }));
                }

                // Get Comments
                if (commentsRes.ok) {
                    const commentsData = await commentsRes.json();
                    const formattedComments = commentsData.comments.map(comment => {
                        if (!comment.date) return comment;
                        const [d, m, y] = comment.date.split('/');
                        return {
                            ...comment,
                            date: new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        };
                    });
                    setComments(formattedComments);
                }

            } catch(err) {
                console.error("Fetch error: ", err);
                setErrors("Failed to load page data.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchEverything();
    }, [postSlug, token]);

    async function handleCommentSubmit(e) {
        e.preventDefault();

        const postAuthorId = formData.userId;
        const postId = formData.postId;

        try {
            setIsCommenting(true);

            if (newComment.name.trim().length < 5) {
                setCommentError("Name must contain at least 5 real characters.");
                return;
            }

            const res = await fetch(`${API_URL}/api/author/${postAuthorId}/post/${postId}/post-comment`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(newComment)
            })

            if(!res.ok) {
                setErrors("Failed to post comment.")
                return;
            }

            setSuccessMessage("Success: Comment is now published!");
            setCommentError('');

            setTimeout(() => {
                setSuccessMessage("");
            }, 3000);

            setComments(prevComments => [
                ...prevComments, 
                { 
                    name: newComment.name, 
                    comment: newComment.comment, 
                    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
                }
            ]);

            setNewComment({name: '', comment: ''});
        }
        catch(err) {
            console.error("Failed to post comment: ", err);
            setErrors("Internal server error. Please refresh")
        }
        finally {
            setIsCommenting(false);
        }
    }


    const handleLogout = async (e) => {
        e.preventDefault(e)
        const res = await fetch(`${API_URL}/api/logout`, {
            method: 'GET'
        })

        if(!res.ok) {
            throw new Error("Can't logout, please try again!")
        }
        else {
            localStorage.removeItem('jwtToken');
            setUser({auth: false, name: ''});
            setToastMessage("You have successfully logged out!");
        }
    }

    const handleChange = async (e) => {
        const {name, value} = e.target;

        setNewComment(prevState => ({
            ...prevState,
            [name]: value
        }))
    }

    return (
        <div className="w-full min-h-screen flex flex-col">
            <nav className="w-full bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
                <div className="flex flex-wrap items-center justify-between w-full max-w-6xl mx-auto px-4 py-3 sm:h-16 sm:py-0">
                    <div className="font-geist font-bold text-xl text-slate-900 tracking-tight order-1 shrink-0">
                        MyDevBlog
                    </div>

                    <div className="flex items-center gap-4 sm:gap-6 order-2 sm:order-3 shrink-0">
                        {user.auth ? (
                            <>
                                <p className="text-sm text-slate-700 hidden sm:block">
                                    Welcome <strong>{user.name}</strong>
                                </p>
                                <button 
                                    onClick={handleLogout}
                                    className="px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
                                >
                                    Logout
                                </button>
                            </>
                        ): (
                            <Link 
                                to={"/login"}
                                className="px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
                            >
                                Log In
                            </Link>
                        )}
                    </div>

                    <div className="flex items-center gap-6 font-geist text-[14px] sm:text-[15px] font-medium text-slate-500 order-3 sm:order-2 w-full sm:w-auto mt-3 sm:mt-0 pt-3 sm:pt-0 border-t border-slate-100 sm:border-none">
                        <Link to="/profile" className="hover:text-slate-900 transition-colors">
                            Home
                        </Link>
                        <Link to="/about" className="hover:text-slate-900 transition-colors">
                            About
                        </Link>
                        <a href="https://github.com/rudrakshkr" target="_blank" rel="noreferrer" className="hover:text-slate-900 transition-colors">
                            GitHub
                        </a>
                    </div>
                </div>
            </nav>

            <main className="w-full flex flex-col flex-1 bg-[#f8fafc]">
                {isLoading ? (
                    <div className="flex flex-1 justify-center items-center">
                        <ThreeDots
                            visible={true}
                            height="150"
                            width="150"
                            color="#4fa94d"
                            radius="9"
                            ariaLabel="three-dots-loading"
                            wrapperStyle={{}}
                            wrapperClass=""
                        />
                    </div>
                ): (
                    <>
                        {errors && (
                            <div className="p-4 m-4 max-w-3xl mx-auto w-full bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm text-center font-medium">
                                {errors}
                            </div>
                        )}

                        {/* Toast Notification  */}
                        <div
                            className={cn(
                                "fixed top-10 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ease-out w-[90%] max-w-[350px] sm:w-auto",
                                toastMessage 
                                    ? "opacity-100 translate-y-0" 
                                    : "opacity-0 -translate-y-8 pointer-events-none"
                            )}
                        >
                            <div className="flex items-center gap-3 bg-white border border-emerald-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)] px-4 sm:px-5 py-3 rounded-xl w-full sm:min-w-[300px]">
                                
                                <div className="flex items-center justify-center size-8 bg-emerald-50 rounded-lg shrink-0">
                                    <svg className="size-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                
                                <div className="flex flex-col gap-0.5 w-full">
                                    <p className="text-[14px] font-bold text-slate-900 leading-none">Success</p>
                                    <p className="text-[13px] font-medium text-slate-500 leading-snug">
                                        {toastMessage}
                                    </p>
                                </div>
                                
                            </div>
                        </div>

                        {formData && (
                            <article className="w-full max-w-3xl mx-auto px-6 py-12 md:py-12">
                                
                                {/* Header Section */}
                                <header className="mb-8">
                                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight">
                                        {formData.postTitle || "Post Title"}
                                    </h1>
                                    <div className="flex flex-col text-[15px] font-medium text-slate-600 gap-0.5">
                                        <span className="text-slate-900 font-semibold">{formData.postAuthor}</span>
                                        <span className="text-slate-500">{formData.postDate || "March 15, 2024"}</span>
                                        <span className="text-slate-500">Read Time: {`${formData.postReadMin} Min` || "0 Min"}</span>
                                    </div>
                                </header>

                                <hr className="border-slate-200 mb-10" />

                                {/* Content Section */}
                                <div 
                                    className="text-lg text-slate-800 leading-relaxed font-geist
                                            [&_p]:mb-6 
                                            [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-12 [&_h2]:mb-6
                                            [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mt-8 [&_h3]:mb-4
                                            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-6 [&_ul>li]:mb-2
                                            [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-6 [&_ol>li]:mb-2
                                            [&_a]:text-indigo-600 [&_a]:underline [&_a]:underline-offset-4
                                            [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-slate-600
                                            [&_img]: max-w-full [&_img]:h-auto [&_img]:rounded-xl"
                                    dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(formData.postDescription)}} 
                                />

                                <hr className="border-slate-200 mt-12 mb-12" />

                                {successMessage && (
                                    <div className="p-4 mb-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm text-center font-medium">
                                        {successMessage}
                                    </div>
                                )}

                                {/* Comment Section */}
                                {user.auth ? (
                                    <section className="pb-10">
                                        <h2 className="text-3xl font-bold text-slate-900 mb-8 tracking-tight">Leave a Comment</h2>
                                        
                                        <form className="flex flex-col gap-5 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200/60" onSubmit={handleCommentSubmit}>
                                            {commentError && (
                                                <div className="p-4 m-4 max-w-3xl mx-auto w-full bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm text-center font-medium">
                                                    {commentError}
                                                </div>
                                            )}

                                            <div className="flex flex-col gap-1.5">
                                                <label htmlFor="name" className="text-sm font-semibold text-slate-700 ml-1">Name</label>
                                                <input 
                                                    type="text" 
                                                    id="name" 
                                                    name="name"
                                                    value={newComment.name}
                                                    onChange={handleChange}
                                                    minLength={5}
                                                    maxLength={30}
                                                    title="Name must be atleast 5-30 characters long."
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all text-slate-900"
                                                    placeholder="Your Name"
                                                    required
                                                />
                                            </div>
                                            
                                            <div className="flex flex-col gap-1.5">
                                                <label htmlFor="comment" className="text-sm font-semibold text-slate-700 ml-1">Comment</label>
                                                <textarea 
                                                    id="comment" 
                                                    name="comment"
                                                    value={newComment.comment}
                                                    onChange={handleChange}
                                                    rows="5" 
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 outline-none transition-all resize-y text-slate-900"
                                                    placeholder="What are your thoughts?"
                                                    required
                                                ></textarea>
                                            </div>

                                            

                                            <button 
                                                type="submit" 
                                                disabled={isCommenting}
                                                className="flex items-center justify-center gap-2 mt-2 px-8 py-3.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 hover:-translate-y-0.5 transition-all w-full md:w-auto md:self-start shadow-sm disabled:opacity-70 disabled:hover:translate-y-0 disabled:cursor-not-allowed"                                        
                                            >
                                                {isCommenting && (
                                                    <TailSpin
                                                        visible={true}
                                                        height="20"
                                                        width="20"
                                                        color="#ffffff"
                                                        ariaLabel="tail-spin-loading"
                                                        radius="1"
                                                    />
                                                )}
                                                <span>{isCommenting ? "Posting..." : "Post Comment"}</span>
                                            </button>
                                        </form>
                                    </section>
                                ): (
                                    <section className="flex flex-col items-center justify-center gap-3 bg-slate-50 p-8 md:p-12 rounded-2xl border border-slate-200/60 shadow-sm text-center">
            
                                        {/* Lock Icon */}
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-200 text-slate-400 mb-3">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                        </div>

                                        <h3 className="text-xl font-bold text-slate-900">Join the Conversation</h3>
                                        <p className="text-slate-600 max-w-md mb-3 leading-relaxed">
                                            You must be logged in to share your thoughts. Log in to your account or sign up to leave a comment!
                                        </p>

                                        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto mt-4 px-4 sm:px-0">
                                            <Link 
                                                to="/login" 
                                                className="px-8 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 hover:-translate-y-0.5 transition-all shadow-sm"
                                            >
                                                Log In
                                            </Link>
                                            <Link 
                                                to="/sign-up" 
                                                className="px-8 py-2.5 bg-white text-slate-700 font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 hover:-translate-y-0.5 transition-all shadow-sm"
                                            >
                                                Sign Up
                                            </Link>
                                        </div>
                                        
                                    </section>
                                )}

                                {/* Display comments  */}

                                <section className="mt-10 pt-10 border-t border-slate-200">
                                    <h3 className="text-2xl font-bold text-slate-900 mb-8 tracking-tight">
                                        Comments {comments && comments.length > 0 ? <span className="text-slate-500 font-medium text-lg ml-1">({comments.length})</span> : ''}
                                    </h3>

                                    {!comments || comments.length === 0 ? (
                                        <div className="p-8 text-center bg-slate-50 border border-slate-100 rounded-2xl">
                                            <p className="text-slate-500 italic">No comments yet. Be the first to share your thoughts!</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-6">
                                            {comments.map((c, index) => (
                                                <div key={index} className="p-6 bg-white rounded-2xl shadow-sm border border-slate-200/60 flex gap-4">
                                                    
                                                    <div className="w-10 h-10 shrink-0 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-lg">
                                                        {c.name ? c.name.charAt(0).toUpperCase() : 'U'}
                                                    </div>
                                                    
                                                    <div className="flex flex-col gap-1.5 w-full">
                                                        <div className="flex justify-between items-center">
                                                            <span className="font-semibold text-slate-900">{c.name || "Anonymous"}</span>
                                                            <span className="text-xs text-slate-400">{c.date}</span>
                                                        </div>
                                                        <p className="text-slate-700 leading-relaxed text-[15px]">
                                                            {c.comment} 
                                                        </p>
                                                    </div>
                                                    
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </section>

                            </article>
                        )}
                    </>
                )}
            </main>
        </div>
    )
}

export default ShowPost;