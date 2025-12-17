import Header from "@/components/Header/Header";
import NavButton from "@/components/NavButton/NavButton";
import OptionForm from "@/components/OptionForm/OptionForm";
import Options from "@/components/OptionForm/Options/Options";
import Balls from "@/components/Balls/Balls";

const BallsPage = () => {
  return (
    <>
      <Header pageType="select" pageTitle="BALLS" />
      <main>
        < OptionForm formName="balls" className="form">
          <div className="form__body">
            < Options val="15" defaultChecked>
              <Balls amount={15} />
            </ Options>
            < Options val="10">
              <Balls amount={10} />
            </ Options>
            < Options val="6">
              <Balls amount={6} />
            </ Options>
          </div>

          <div className="form__footer">
            < NavButton prev disabled />
            < NavButton next to="/setup/frames" />
          </div>
        </ OptionForm>
      </main>
    </>
  )
}

export default BallsPage;