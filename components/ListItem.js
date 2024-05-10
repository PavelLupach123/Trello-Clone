import Component from '../library/Component.js';
import CardList from './CardList.js';

class ListItem extends Component {
	render() {
		const {
			list: { title, cards, isCardCreatorOpen },
		} = this.props;

		return `
				<div class="list-item-container">
					<div class="list-item-header">
						<textarea class="list-item-title">${title.trim()}</textarea>
						<button class="delete-list-btn bx bx-x"></button>
					</div>
					<div class="card-list-container">${new CardList({ cards }).render()}</div>
					<div class="card-creator-container">
						${isCardCreatorOpen ? 
							`<form class="card-creator">
								<textarea class="new-card-title" placeholder="Назва таски!" autofocus></textarea>
								<div class="card-control">
									<button class="add-card-btn">Додати таску</button>
									<button type="button" class="bx bx-x bx-md card-creator-close-btn"></button>
								</div>
							</form>` : 
							`<button class="card-creator-open-btn">Додати таску</button>`
						}
					</div>
				</div>
    `;
	}
}

export default ListItem;
