import './Header.css';

type HeaderProps = {
  pageType: string;
  pageTitle: string;
}

function Header({ pageType, pageTitle }: HeaderProps) {

  let span = '';
  if (pageType === "select") { span = 'select your' }
  if (pageType === "text") { span = 'enter the' }

  return (
    <header className="header">
      <h1 className="header__title"><span className="header__span">{span}</span> {pageTitle}</h1>
    </header>
  )
}

export default Header;