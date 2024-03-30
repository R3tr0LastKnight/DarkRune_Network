import React, { useRef } from "react";
import logo from "./Assets/logo.png";
import google from "./Assets/google.png";
import "./App.css";

import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import { collection, query, orderBy, limit, addDoc } from "firebase/firestore";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useState } from "react";
import moment from "moment";

firebase.initializeApp({
  apiKey: "AIzaSyCetFItoXK2PZLhJCp2whRehjaS-n3LZ9I",
  authDomain: "cursed-scrolls.firebaseapp.com",
  projectId: "cursed-scrolls",
  storageBucket: "cursed-scrolls.appspot.com",
  messagingSenderId: "103452144610",
  appId: "1:103452144610:web:c5d388a543f1cae99dffbb",
  measurementId: "G-J44R6Z4WB3",
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);

  // make redable time
  const makeReadableTime = (isoTime, date) => {
    const time = new Date(isoTime);
    // Convert the time to a readable format
    if (date === true) {
      const readableTime = time.toLocaleDateString("en-UK", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      return readableTime;
    } else {
      const readableTime = time.toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
      return readableTime;
    }
  };

  const SignIn = () => {
    const signInWithGoogle = () => {
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider);
    };
    return (
      <div
        className="px-4 py-2 mx-auto border border-black rounded mt-8 flex items-center gap-1  group hover:text-white hover:bg-black transition-all cursor-pointer"
        onClick={signInWithGoogle}
      >
        Sign in With Google
        <img className="h-5 w-5 group-hover:invert" src={google} alt="" />
      </div>
    );
  };

  const Chatroom = () => {
    const [formValue, setFormValue] = useState("");

    const messagesRef = collection(firebase.firestore(), "messages");
    const q = query(messagesRef, orderBy("createdAt"), limit(25));
    const [messages] = useCollectionData(q, { idField: "id" });
    console.log(messages);

    const sendMessage = async (e) => {
      e.preventDefault();

      const { uid, photoURL } = auth.currentUser;

      await addDoc(collection(firestore, "messages"), {
        text: formValue,
        createdAt: moment().toISOString(new Date()),
        uid,
        photoURL,
      });
      setFormValue("");
      scroll.current.scrollIntoView({ behavior: "smooth" });
    };

    const scroll = useRef();

    return (
      <div className="flex flex-col w-full ">
        <div className="px-4 relative flex flex-col  gap-4 mt-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ">
          {messages &&
            messages.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
          <div ref={scroll}></div>
        </div>
        <form
          className="w-full fixed bottom-0 border-2 border-[#212529] bg-[#000] rounded z-50  shadow-[0_3px_10px_rgb(0,0,0,0.2)] max-w-[30rem] mx-auto "
          onSubmit={sendMessage}
        >
          <input
            className="text w-[80%] h-full py-4 px-4 bg-[#E9ECEF] "
            value={formValue}
            onChange={(e) => setFormValue(e.target.value)}
          />
          <button className="w-[20%] h-full py-4 text-white bg-[#212529]">
            Send
          </button>
        </form>
      </div>
    );
  };

  const ChatMessage = (props) => {
    const { text, uid, photoURL, createdAt } = props.message;

    const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

    return (
      <div
        className={` items-cent gap-3  ${
          messageClass === "sent"
            ? "flex flex-row-reverse justify-start "
            : " flex flex-row justify-start"
        }`}
      >
        <div className="min-w-10 rounded-full overflow-hidden h-10 w-10 relative bottom-1">
          <img className="" src={photoURL} alt="" />
        </div>
        <div>
          <p
            className={`relative p-3 rounded-xl bg-[#CED4DA] text-gray-900 ${
              messageClass === "sent" ? "rounded-tr-none" : "rounded-tl-none"
            }`}
          >
            {text}
            {/* <div
              className={`flex text-[8px] absolute bottom-0.5 ${
                messageClass === "sent" ? "right-4" : "rounded-tl-none"
              }`}
            >
              {makeReadableTime(createdAt, false)}
            </div> */}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col ">
      <nav className="flex bg-[#212529] text-white px-7 py-4 fixed top-0 w-full justify-between items-center z-50 shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]">
        <div className="flex items-center gap-4 text-2xl">
          <img className="w-12 h-12 invert" src={logo} alt="" /> DarkRune
          Network
        </div>
        {user && (
          <div
            className="flex gap-4 items-center cursor-pointer"
            onClick={() => auth.signOut()}
          >
            SignOut
            <div className=" min-w-7 rounded-full overflow-hidden h-7 w-7">
              <img className="" src={user?.photoURL} alt="" />
            </div>
          </div>
        )}
      </nav>
      <div
        className={` flex text-black h-full min-w-[30rem] max-w-[30rem] py-20  mx-auto shadow-[0_3px_10px_rgb(0,0,0,0.2)]${
          user ? " h-full" : "h-1/2 relative top-40"
        } `}
      >
        {user ? <Chatroom /> : <SignIn />}
      </div>
    </div>
  );
}

export default App;
