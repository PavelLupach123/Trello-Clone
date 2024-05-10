import Component from '../library/Component.js';

class ListCreator extends Component {
	render() {
		const {
			listCreator: { isOpen },
			lists,
		} = this.props;

		return `
      <div class="list-creator-container">
        ${isOpen ? 
            `<form class="list-creator">
              <input type="text" class="new-list-title" placeholder="Назва нового списку!" autofocus maxLength="512"/>
              <div class="list-control">
								<button class="add-list-btn">Створити список</button>
								<button type="button" class="bx bx-x bx-md list-creator-close-btn" ></button>
							</div>
            </form>` : 
            `<button class="list-creator-open-btn">+ Додати ${lists.length ? 'інший' : 'новий'} список</button>`}
      </div>
    `;
	}
}

export default ListCreator;
