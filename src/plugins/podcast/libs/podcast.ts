interface SearchResponse {
  wrapperType: string
  kind: string
  collectionId: number
  trackId: number
  artistName: string
  collectionName: string
  trackName: string
  collectionCensoredName: string
  trackCensoredName: string
  collectionViewUrl: string
  feedUrl: string
  trackViewUrl: string
  artworkUrl30: string
  artworkUrl60: string
  artworkUrl100: string
  collectionPrice: number
  trackPrice: number
  collectionHdPrice: number
  releaseDate: string
  collectionExplicitness: string
  trackExplicitness: string
  trackCount: number
  trackTimeMillis: number
  country: string
  currency: string
  primaryGenreName: string
  contentAdvisoryRating: string
  artworkUrl600: string
  genreIds: string[]
  genres: string[]
}


export async function search(query: string) : Promise<SearchResponse[] | null> {
  const url = `https://itunes.apple.com/search?entity=podcast&term=${encodeURIComponent(query)}`;

  return fetch(url)
    .then(res => res.json())
    .then(res => {
      if(res.resultCount === 0) return null;

      return res.results;
    })
}