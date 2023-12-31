import "/src/index.css";
import { v4 as uuid } from 'uuid';
import { useEffect, useRef, useState } from "react";
import { collection, doc, setDoc, getDocs, deleteDoc, limit } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db } from "/src/config/firebase.js";
import Loader from "../components/Loader";

export default function Dashboard() {
    const dbRenungan = import.meta.env.VITE_REACT_RENUNGAN_DBNAME
    const dbTodos = import.meta.env.VITE_REACT_TODO_DBNAME
    const navigate = useNavigate()
    const formRef = useRef()
    const [loading, setLoading] = useState(false)
    const [showPopup, setShowPopup] = useState(false)
    const [propPopup, setPropPopup] = useState('')
    const [changeSection, setChangeSection] = useState('')
    const [formTitle, setFormTitle] = useState('Add new Renungan')
    const [showForm, setShowForm] = useState(false)

    const [listRenungan, setListRenungan] = useState([])
    const [author, setAuthor] = useState('')
    const [content, setContent] = useState('')
    const [postDate, setPostDate] = useState('')
    const [editDate, setEditDate] = useState('')
    const [title, setTitle] = useState('')
    const [series, setSeries] = useState('')
    const [updateId, setUpdateId] = useState(null)
    const [verse, setVerse] = useState('')

    const [todoList, setTodoList] = useState([])
    const [note, setNote] = useState('')

    async function handleSubmitRenungan(e) {
        e.preventDefault();
        try {
            setLoading(true)
            const uniqueId = uuid()
            const docRef = doc(db, dbRenungan, (updateId ? updateId : uniqueId))
            await setDoc(docRef, {
                author: author,
                content: content,
                postedAt: postDate,
                updatedAt: editDate ? editDate : null,
                title: title,
                series: series,
                verse: verse,
            });
            setLoading(false)
            handlePopup('Data added succesfully!')
            getRenungan()
            formRef.current.reset();
            setTitle('')
            setPostDate('')
            setAuthor('')
            setVerse('')
            setContent('')
            setUpdateId('')
            setSeries('')
            setFormTitle('Add new renungan')
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    }
    
    async function getRenungan() {
        let listData = [];
        const querySnapshot = await getDocs(collection(db, dbRenungan));
        querySnapshot.forEach((doc) => {
            listData.push({
                docId: doc.id,
                data: doc.data()
            })
        });
        setListRenungan(listData)
    }

    async function delRenungan(id) {
        try {
            setLoading(true)
            await deleteDoc(doc(db, dbRenungan, id))
            setLoading(false)
            handlePopup('Data Deleted')
            getRenungan()
        } catch (error) {
            console.log("Error Deleting:", error)
        }
    }

    async function handleSubmitTodo(e) {
        e.preventDefault();
        try {
            setLoading(true)
            const uniqueId = uuid()
            const docRef = doc(db, dbTodos, uniqueId);
            await setDoc(docRef, {
                note: note,
            });
            setLoading(false)
            handlePopup('Data added succesfully!')
            setNote('')
            getTodos()
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    } 

    async function delTodo(id) {
        try {
            setLoading(true)
            await deleteDoc(doc(db, dbTodos, id))
            setLoading(false)
            handlePopup('Data Deleted')
            getTodos()
        } catch (error) {
            console.log("Error Deleting:", error)
        }
    }

    async function getTodos() {
        let listData = [];
        const querySnapshot = await getDocs(collection(db, dbTodos));
        querySnapshot.forEach((doc) => {
            listData.push({
                docId: doc.id,
                data: doc.data()
            })
        });
        setTodoList(listData)
    }

    const ListRenungan = () => {
        return (
            <>
                <table cellSpacing={0}>
                    <tr>
                        <th></th>
                        <th className="title">Title</th>
                        <th className="series">Series</th> 
                        <th className="date">Date Posted</th>
                        <th className="author">Author</th>
                        <th className="verse">Verse</th>
                        <th></th>
                        <th id="tdActions">Actions</th>
                    </tr>
                    {listRenungan.map((renungan, i) => (
                        <tr key={i}>
                            <td>{i + 1}</td>
                            <td className="title">{renungan.data.title}</td>
                            <td className="series">{renungan.data.series}</td>
                            <td className="date">{renungan.data.postedAt}</td>
                            <td className="author">{renungan.data.author}</td>
                            <td className="verse">{renungan.data.verse}</td>
                            <td className="goToPage"><a href={`/renungan/${renungan.docId}`}>Visit</a></td>
                            <td id="tdActions">
                                <button id="editBtn" onClick={() => {
                                    setShowForm(!showForm)
                                    setFormTitle(`Edit Renungan ${renungan.data.id}`)
                                    setUpdateId(renungan.data.id)
                                    setTitle(renungan.data.title)
                                    setAuthor(renungan.data.author)
                                    setPostDate(renungan.data.postedAt)
                                    setEditDate(new Date())
                                    setVerse(renungan.data.verse)
                                    setContent(renungan.data.content)
                                    setSeries(renungan.data.series)
                                }}><ion-icon name="create-outline"></ion-icon></button>
                                <button id="delBtn" onClick={() => delRenungan(renungan.docId)}><ion-icon id="icon" name="trash-outline"></ion-icon></button>
                            </td>
                        </tr>
                    ))}
                </table>
            </>
        )
    }

    const Todo = () => {
        return (
            <>
                {todoList?.map((item, i) => (
                    <div className="noteContainer" key={i}>
                        <p>{i + 1}. {item.data.note}</p>
                        <span>
                            <button className="primaryButton" onClick={() => delTodo(item.docId)}><ion-icon id="icon" name="trash-outline"></ion-icon></button>
                        </span>
                    </div>
                ))}
            </>
        )
    }

    const Popup = () => {
        return (
            <>
                <div className="popup" style={{ display: showPopup ? 'flex' : 'none' }}>
                    <div className="container">
                        <div className="icon">
                            <ion-icon id="icons" name="checkmark-outline"></ion-icon>
                        </div>
                        <h1>{ propPopup }</h1>
                    </div>
                </div>
            </>
        )
    }

    function handlePopup(text) {
        const propText = text
        setPropPopup(propText)
        setShowPopup(true)
        setTimeout(() => {
            setShowPopup(false)
        }, 800);
    }

    function handleExit() {
        localStorage.clear()
        navigate('/')
    }

    useEffect(() => {
        getRenungan()
        getTodos()
    }, [])

    return (
        <>
            {loading && <Loader />}
            <Popup />
            <div className="dashboardNavbar">
                <section>
                    <button className="primaryButton" onClick={() => setChangeSection('')}>Home</button>
                    <button className="primaryButton" onClick={() => setChangeSection('addJadwal')}>Jadwal</button>
                    <button className="primaryButton" onClick={() => setChangeSection('addRenungan')}>Renungan</button>
                    <button className="primaryButton" onClick={() => handleExit()}>Exit</button>
                    {/* <button onClick={() => handlePopup('test')}>test</button> */}
                </section>
            </div>
            <div className="dashboard">
                <div className="container">
                    {changeSection == '' &&
                        <div className="homeSection">
                            <div className="todo">
                                <p>Kalau lupa mau ngapain, tulis disini aja</p>
                                <br />
                                <form ref={formRef} action="" onSubmit={handleSubmitTodo}>
                                    <input type="text" onChange={(e) => setNote(e.target.value)} value={note} placeholder="Add new note..."/>
                                    <button className="primaryButton" type="submit">+</button>
                                </form>
                                <Todo />
                            </div>
                        </div>
                    }
                    {changeSection == 'addJadwal' && 
                        <section>

                        </section>
                    }
                    {changeSection == 'addRenungan' &&
                        <section>
                            <div className="dataSection">
                                <a className="primaryButton" href="#formRenungan" onClick={() => setShowForm(!showForm)}>
                                    {showForm ? <p>Cancel</p> : <p>Add new</p>}
                                </a>
                                <ListRenungan />
                            </div>
                            {showForm && 
                                <form ref={formRef} action="" onSubmit={handleSubmitRenungan} id="formRenungan">
                                    <h3>{formTitle}</h3>
                                    <label htmlFor="title">Judul:</label>
                                    <input id="title" type="text" onChange={(e) => setTitle(e.target.value)} value={title} />
                                    <p onClick={() => {
                                        setTitle('Manna Surgawi')
                                        setSeries('Manna Surgawi')
                                        setAuthor('Pdt. I Ketut Miasa.M.Div.')
                                    }}>+</p>
                                    <label htmlFor="series">Series:</label>
                                    <input id="title" type="text" onChange={(e) => setSeries(e.target.value)} value={series} /> 
                                    <label htmlFor="date">Tanggal:</label>
                                    <input id="date" type="date" onChange={(e) => setPostDate(e.target.value)} value={postDate}/> 
                                    <label htmlFor="author">Penulis:</label>
                                    <input id="author" type="text" onChange={(e) => setAuthor(e.target.value)} value={author} /> 
                                    <label htmlFor="verse">Ayat:</label>
                                    <input id="verse" type="text" onChange={(e) => setVerse(e.target.value)} value={verse}/> 
                                    <label htmlFor="content">Content: </label>
                                    <textarea id="content" type="text" onChange={(e) => setContent(e.target.value)} value={content}/>
                                    <button className="primaryButton" type="submit" id="submitBtn">Publish</button>
                                </form>
                            }
                        </section>
                    }
                </div>
            </div>
      </>
  )
}
