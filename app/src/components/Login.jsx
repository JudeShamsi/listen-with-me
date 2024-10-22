export const Login = ({server}) => {

    return (
      <a
      className='App-login-button'
      href={`${server}/auth/login`}
      rel="noreferrer"
      >Login
      </a>
    )
  }
