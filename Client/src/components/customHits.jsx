import React from 'react';
import { InstantSearch, Stats, SortBy } from 'react-instantsearch/dom';
import { connectHits, connectInfiniteHits } from 'react-instantsearch/connectors';

import HitComponent from './hitComponent.jsx';
import OneTripSpots from './oneTripSpots.jsx';
import Infinite from './infinite.jsx';


// {hits.map(hit => {
//           return (<OneTripSpots trip={hit} key={hit.ObjectID}/>);
//         }
//         )}
const CustomHits = connectHits(({ hits }) => {

  return (
    <div>

      <div className='row'>
        {hits.map((hit, i) => {
          return (<OneTripSpots trip={hit} key={i}/>);
        }
        )}
      </div>
    </div>
  );
});

export default CustomHits;