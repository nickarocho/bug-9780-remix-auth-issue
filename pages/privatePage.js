import { withSSRContext } from "aws-amplify";

function PrivatePage({ authenticated, username }) {
  if (!authenticated) {
    return <h1>Not authenticated</h1>;
  }
  return <h1>Hello {username} from SSR route!</h1>;
}

export async function getServerSideProps({ req, res }) {
  const { Auth } = withSSRContext({ req });

  let user;
  try {
    user = await Auth.currentAuthenticatedUser();
    // console.log({ user });
    return {
      props: {
        authenticated: true,
        username: user.username,
      },
    };
  } catch (err) {
    console.error({ user, err });
    return {
      props: {
        authenticated: false,
      },
    };
  }
}

export default PrivatePage;
