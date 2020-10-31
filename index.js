import { __ } from '@wordpress/i18n';
import { useState, RawHTML } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { TextControl, Popover, Button, Spinner } from '@wordpress/components';

const NAMESPACE = 'gutenberg-post-picker';

/**
 * Post Picker
 *
 * @param {Object} props react props
 * @return {*} React JSX
 */
const PostPicker = (props) => {
	const { onSelectPost, label = '' } = props;

	const [searchString, setSearchString] = useState('');
	const [searchResults, setSearchResults] = useState([]);
	const [isLoading, setIsLoading] = useState(false);

	function handleItemSelection(post) {
		onSelectPost(post);
		setSearchResults([]);
		setSearchString('');
	}

	/**
	 * Using the keyword and the list of tags that are linked to the parent block
	 * search for posts that match and return them to the autocomplete component.
	 *
	 * @param {string} keyword search query string
	 */
	const handleSearchStringChange = (keyword) => {
		setSearchString(keyword);
		setIsLoading(true);
		Promise.all([
			apiFetch({
				path: `/wp/v2/pages?search=${keyword}`,
			}),
			apiFetch({
				path: `/wp/v2/posts?search=${keyword}`,
			}),
		]).then(([pages, posts]) => {
			setSearchResults([...pages, ...posts]);
			setIsLoading(false);
		});
	};

	return (
		<div className={`${NAMESPACE}`}>
			<TextControl
				label={label}
				value={searchString}
				onChange={handleSearchStringChange}
			/>
			{searchString.length ? (
				<Popover focusOnMount={false} noArrow={false}>
					<ul className={`${NAMESPACE}-grid`}>
						{isLoading && <Spinner />}
						{!isLoading && !searchResults.length && (
							<li className={`${NAMESPACE}-grid-item`}>
								<Button disabled>{__('No Items found', NAMESPACE)}</Button>
							</li>
						)}
						{searchResults.map((post, index) => {
                            const isLastItem = index === searchResults.length -1;
                            if (!post.title.rendered.length) {
                                return null;
							}
							return (
								<li key={post.id} className={`${NAMESPACE}-grid-item`}>
									<Button onClick={() => handleItemSelection(post)}>
										<RawHTML>{post.title.rendered}</RawHTML>
									</Button>
									{ !isLastItem ?
                                        <hr /> : null
                                    }
								</li>
							);
						})}
					</ul>
				</Popover>
			) : null}
		</div>
	);
};

export default PostPicker;
