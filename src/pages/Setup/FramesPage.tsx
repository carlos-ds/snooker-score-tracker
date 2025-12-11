import Header from "@/components/Header/Header"
import NavButton from "@/components/NavButton/NavButton";
import OptionForm from "@/components/OptionForm/OptionForm";
import Options from "@/components/OptionForm/Options/Options";

function FramesPage() {
  return (
    <>
      <Header pageType="select" pageTitle="FRAMES" />
      <main>
        < OptionForm formName="frames" className="form">
          <div className="form__body">
            <div className="form__group">
              < Options className="tile" val="1" defaultChecked>
                <span className="option__label-text-small">Best of</span>
                <p className="option__label-text">1</p>
              </ Options>
              < Options className="tile" val="3">
                <span className="option__label-text-small">Best of</span>
                <p className="option__label-text">3</p>
              </ Options>
            </div>
            <div className="form__group">
              < Options className="tile" val="5">
                <span className="option__label-text-small">Best of</span>
                <p className="option__label-text">5</p>
              </ Options>
              < Options className="tile" val="7">
                <span className="option__label-text-small">Best of</span>
                <p className="option__label-text">7</p>
              </ Options>
            </div>
            <div className="form__group">
              < Options className="tile tile--input" val="custom" hasInput>
                <span className="option__label-text-small">Best of</span>
              </ Options>
            </div>
          </div>

          <div className="form__footer">
            < NavButton prev />
            < NavButton next to="/setup/modes" />
          </div>
        </ OptionForm>
      </main>
    </>
  )
}

export default FramesPage;