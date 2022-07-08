import Head from "next/head";
import styles from "../styles/Home.module.css";

import { useEffect, useState } from "react";
import { Auth, DataStore } from "aws-amplify";

import { Task } from "../src/models";
import Link from "next/link";

export default function Home() {
  const [user, setUser] = useState(null);
  const [tempUser, setTempUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const fetchUser = async () => {
    try {
      const fetchUserResult = await Auth.currentAuthenticatedUser();
      setUser(fetchUserResult);
      console.log({ fetchUserResult });
    } catch (err) {
      setUser(null);
      console.error("fetchUser error: ", err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleSignIn = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("missing email or password!");
      return null;
    }

    try {
      const result = await Auth.signIn(email, password);
      console.log("sign in result", result);

      setUser(result);
    } catch (err) {
      console.error("sign in error:", err);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("missing email or password!");
      return null;
    }

    try {
      const result = await Auth.signUp(email, password);
      console.log("sign up result", result);

      const { user, userConfirmed } = result;

      setTempUser({ ...user, userConfirmed });
    } catch (err) {
      console.error("sign up error:", err);
    }
  };

  const handleConfirmSignUp = async (e) => {
    e.preventDefault();

    if (!code) {
      alert("missing code!");
      return null;
    }

    try {
      const result = await Auth.confirmSignUp(email, code);
      console.log("confirm user result", result);

      setTempUser({
        ...tempUser,
        userConfirmed: result === "SUCCESS" ? true : false,
      });
    } catch (err) {
      console.error("confirm sign up error:", err);
    }
  };

  const handleSignOut = async () => {
    try {
      const result = await Auth.signOut();
      console.log("sign out result", result);
      fetchUser();
    } catch (err) {
      console.error("sign out error:", err);
    }
  };

  const handleSubmitTodo = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const todo = form.get("todo");

    try {
      const user = await Auth.currentAuthenticatedUser();

      const task = await DataStore.save(
        new Task({
          name: todo,
          done: false,
        })
      );
      console.log({ task });
    } catch (err) {
      console.error("handleSubmitTodo error: ", err);
    }
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Next.js/Amplify Todos</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Next.js Todos</h1>

        <div className={styles.description}>
          {user ? (
            <>
              <p>Welcome, {user.username}!</p>
              <a onClick={handleSignOut}>Log out &rarr;</a>
            </>
          ) : (
            <p>Log in or sign up below.</p>
          )}
        </div>

        <div className={styles.grid}>
          {!user && !tempUser ? (
            <>
              <div className={`${styles.card} row`}>
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  name="email"
                  type="email"
                  placeholder="Email"
                />
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  name="password"
                  type="password"
                  placeholder="Password"
                />
                <a onClick={(e) => handleSignIn(e)} className="formAction">
                  Sign In &rarr;
                </a>
                <a onClick={(e) => handleSignUp(e)} className="formAction">
                  Sign Up &rarr;
                </a>
              </div>
            </>
          ) : !user && tempUser && !tempUser.userConfirmed ? (
            <>
              <div className={`${styles.card} row`}>
                <input
                  defaultValue=""
                  onChange={(e) => setCode(e.target.value)}
                  name="code"
                  type="code"
                  placeholder="Code..."
                />
                <a
                  onClick={(e) => handleConfirmSignUp(e)}
                  className="formAction"
                >
                  Confirm &rarr;
                </a>
              </div>
            </>
          ) : !user && tempUser && tempUser.userConfirmed ? (
            <>
              <div className={`${styles.card} row`}>
                <input
                  defaultValue={email}
                  onChange={(e) => setEmail(e.target.value)}
                  name="email"
                  type="email"
                  placeholder="Email"
                />
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  name="password"
                  type="password"
                  placeholder="Password"
                />
                <a onClick={(e) => handleSignIn(e)} className="formAction">
                  Sign In &rarr;
                </a>
              </div>
            </>
          ) : (
            <>
              <Link href="/privatePage">
                <a href="/privatePage" className={styles.card}>
                  <h2>Very secret content &rarr;</h2>
                  <p>Can only see when logged in...</p>
                </a>
              </Link>

              <a
                href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
                className={styles.card}
              >
                <h2>More secrets... &rarr;</h2>
                <p>Something else only users can see here...</p>
              </a>
              <form onSubmit={handleSubmitTodo} className={styles.card}>
                <input type="text" name="todo" placeholder="Todo" />
                <button type="submit" className="formAction">
                  ➕
                </button>
              </form>
            </>
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Created with ❤️... and AWS Amplify.
        </a>
      </footer>
    </div>
  );
}
