import { Container } from "../../../notusComponents/container";
import { SectionHeading } from "../../../notusComponents/section-heading";
import { SignIn as SignInComponent } from "../../../notusComponents/sign-in";

const SignIn = () => {
  return (
    <div className="pt-4">
      <Container className="border-divide border-x">
        <div className="py-8">
          <SectionHeading>Sign In</SectionHeading>
          <div className="mt-8">
            <SignInComponent />
          </div>
        </div>
      </Container>
    </div>
  );
};

export default SignIn;
