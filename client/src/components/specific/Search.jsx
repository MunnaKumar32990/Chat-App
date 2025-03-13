import { Dialog } from '@mui/material'
import React, { useState } from 'react'

const Search = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      nnnnn
    </Dialog>
  );
}

export default Search
