import Header from "@/components/Header/Header";
import NavButton from "@/components/NavButton/NavButton";
import OptionForm from "@/components/OptionForm/OptionForm";
import Options from "@/components/OptionForm/Options/Options";

const ModesPage = () => {
  return (
    <>
      <Header pageType="select" pageTitle="MODES" />
      <main>
        <OptionForm formName="modes" className="form">
          <div className="form__body">
            <Options className="mode-option" val="1v1" defaultChecked formName="modes">
              <div className="mode-option__content">
                <svg className="mode-option__icon" xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="currentColor">
                  <circle cx="32" cy="20" r="12"/>
                  <path d="M12 52c0-8.837 10.163-16 20-16s20 7.163 20 16v4H12v-4z"/>
                </svg>

                <span className="mode-option__vs">VS</span>

                <svg className="mode-option__icon" xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="currentColor">
                  <circle cx="32" cy="20" r="12"/>
                  <path d="M12 52c0-8.837 10.163-16 20-16s20 7.163 20 16v4H12v-4z"/>
                </svg>
              </div>
            </Options>
            <Options className="mode-option" val="team" formName="modes">
              <div className="mode-option__content">
                <svg className="mode-option__icon" xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="currentColor">
                  <circle cx="32" cy="20" r="12"/>
                  <path d="M12 52c0-8.837 10.163-16 20-16s20 7.163 20 16v4H12v-4z"/>
                  <g transform="translate(-10 6) scale(0.75)">
                    <circle cx="32" cy="20" r="12"/>
                    <path d="M12 52c0-8.837 10.163-16 20-16s20 7.163 20 16v4H12v-4z"/>
                  </g>
                </svg>

                <span className="mode-option__vs">VS</span>

                <svg className="mode-option__icon" xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="currentColor">
                  <circle cx="32" cy="20" r="12"/>
                  <path d="M12 52c0-8.837 10.163-16 20-16s20 7.163 20 16v4H12v-4z"/>
                  <g transform="translate(-10 6) scale(0.75)">
                    <circle cx="32" cy="20" r="12"/>
                    <path d="M12 52c0-8.837 10.163-16 20-16s20 7.163 20 16v4H12v-4z"/>
                  </g>
                </svg>
              </div>
            </Options>
          </div>
          <div className="form__footer">
            <NavButton prev />
            <NavButton next to="/setup/players" />
          </div>
        </OptionForm>
      </main>
    </>
  )
}

export default ModesPage;