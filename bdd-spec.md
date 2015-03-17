# TOC
   - [Single line](#single-line)
   - [Escape sequences](#escape-sequences)
   - [Sample file](#sample-file)
<a name=""></a>
 
<a name="single-line"></a>
# Single line
when empty, should return a root node without child.

```js
expect( tifParser.parse( '' ) ).to.eql( {
	depth: 0,
	children: []
} ) ;
```

with a single word, should return a root node with one child, no comment and the word as content.

```js
expect( tifParser.parse( 'Hello' ) ).to.eql( {
	depth: 0,
	children: [ {
		depth: 1,
		line: 1,
		content: 'Hello',
		comment: undefined,
		children: []
	} ]
} ) ;
```

with a many words, should return a root node with one child, no comment and all words as content.

```js
expect( tifParser.parse( 'Hello world! How are you?' ) ).to.eql( {
	depth: 0,
	children: [ {
		depth: 1,
		line: 1,
		content: 'Hello world! How are you?',
		comment: undefined,
		children: []
	} ]
} ) ;
```

with a comment, should return a root node with one child, no content and all words as comment.

```js
expect( tifParser.parse( '# This is a comment' ) ).to.eql( {
	depth: 0,
	children: [ {
		depth: 1,
		line: 1,
		content: undefined,
		comment: 'This is a comment',
		children: []
	} ]
} ) ;
```

with content and comment, should return a root node with one child, having content and comment.

```js
expect( tifParser.parse( 'Hello world! # This is a comment' ) ).to.eql( {
	depth: 0,
	children: [ {
		depth: 1,
		line: 1,
		content: 'Hello world!',
		comment: 'This is a comment',
		children: []
	} ]
} ) ;
```

should trim whitespace in both content and comment.

```js
expect( tifParser.parse( '  \t Hello world! \t   #   \t  This is a comment \t   ' ) ).to.eql( {
	depth: 0,
	children: [ {
		depth: 1,
		line: 1,
		content: 'Hello world!',
		comment: 'This is a comment',
		children: []
	} ]
} ) ;
```

should thow error if the line is indented.

```js
try {
	tifParser.parse( '\tHello world!' ) ;
	expect().fail( 'An exception must have been thrown' ) ;
}
catch ( error ) {
	expect( error.message ).to.match( /Indentation error/ ) ;
}
```

<a name="escape-sequences"></a>
# Escape sequences
\n should be replaced by a newline.

```js
expect( tifParser.parse( 'This content have\\na newline' ) ).to.eql( {
	depth: 0,
	children: [ {
		depth: 1,
		line: 1,
		content: 'This content have\na newline',
		comment: undefined,
		children: []
	} ]
} ) ;
```

\r should be replaced by a carriage return.

```js
expect( tifParser.parse( 'This content have\\ra carriage return' ) ).to.eql( {
	depth: 0,
	children: [ {
		depth: 1,
		line: 1,
		content: 'This content have\ra carriage return',
		comment: undefined,
		children: []
	} ]
} ) ;
```

\t should be replaced by a tab.

```js
expect( tifParser.parse( 'This content have\\ta tab' ) ).to.eql( {
	depth: 0,
	children: [ {
		depth: 1,
		line: 1,
		content: 'This content have\ta tab',
		comment: undefined,
		children: []
	} ]
} ) ;
```

\\ should be replaced by a single backslash.

```js
expect( tifParser.parse( 'This content have \\\\ a single backslash' ) ).to.eql( {
	depth: 0,
	children: [ {
		depth: 1,
		line: 1,
		content: 'This content have \\ a single backslash',
		comment: undefined,
		children: []
	} ]
} ) ;
```

\# should escape the comment.

```js
expect( tifParser.parse( 'This is not \\# a comment' ) ).to.eql( {
	depth: 0,
	children: [ {
		depth: 1,
		line: 1,
		content: 'This is not # a comment',
		comment: undefined,
		children: []
	} ]
} ) ;
```

\\# should *NOT* escape the comment.

```js
expect( tifParser.parse( 'This is \\\\# a comment' ) ).to.eql( {
	depth: 0,
	children: [ {
		depth: 1,
		line: 1,
		content: 'This is \\',
		comment: 'a comment',
		children: []
	} ]
} ) ;
```

\\\# should escape the comment.

```js
expect( tifParser.parse( 'This is not \\\\\\# a comment' ) ).to.eql( {
	depth: 0,
	children: [ {
		depth: 1,
		line: 1,
		content: 'This is not \\# a comment',
		comment: undefined,
		children: []
	} ]
} ) ;
```

\\\\# should *NOT* escape the comment.

```js
expect( tifParser.parse( 'This is \\\\\\\\# a comment' ) ).to.eql( {
	depth: 0,
	children: [ {
		depth: 1,
		line: 1,
		content: 'This is \\\\',
		comment: 'a comment',
		children: []
	} ]
} ) ;
```

should be able to process a mixing of escape sequences.

```js
expect( tifParser.parse( 'mixing\\nmultiple\\rescape\\t\\t\\tsequences\\#\\#\\\\\\t\\n\\t' ) ).to.eql( {
	depth: 0,
	children: [ {
		depth: 1,
		line: 1,
		content: 'mixing\nmultiple\rescape\t\t\tsequences##\\\t\n\t',
		comment: undefined,
		children: []
	} ]
} ) ;
```

<a name="sample-file"></a>
# Sample file
#1 comparison.

```js
var parsed = tifParser.parse( fs.readFileSync( 'sample1.txt' ).toString() ) ;

var expected = {
	depth: 0,
	children: [
		{
			depth: 1,
			line: 2,
			content: undefined,
			comment: "Starting comment",
			children: []
		},
		{
			depth: 1,
			content: "Big One",
			line: 4,
			comment: undefined,
			children: [
				{
					depth: 2,
					line: 5,
					content: "medium1",
					comment: undefined,
					children: []
				},
				{
					depth: 2,
					line: 6,
					content: "medium2",
					comment: undefined,
					children: [
						{
							depth: 3,
							line: 7,
							content: undefined,
							comment: "Comment #1",
							children: []
						},
						{
							depth: 3,
							line: 8,
							content: "little1",
							comment: undefined,
							children: []
						},
						{
							depth: 3,
							line: 9,
							content: undefined,
							comment: "Comment #2",
							children: []
						},
						{
							depth: 3,
							line: 10,
							content: "little2",
							comment: undefined,
							children: []
						}
					]
				},
				{
					depth: 2,
					line: 11,
					content: "medium3",
					comment: "with a comment",
					children: [
						{
							depth: 3,
							line: 12,
							content: undefined,
							comment: "Comment #3",
							children: []
						}
					]
				},
				{
					depth: 2,
					line: 13,
					content: "medium4 with many words",
					comment: undefined,
					children: []
				},
				{
					depth: 2,
					line: 14,
					content: "medium5 with many words",
					comment: "and a comment",
					children: []
				}
			]
		},
		{
			depth: 1,
			line: 18,
			content: "Big2",
			comment: undefined,
			children: [
				{
					depth: 2,
					line: 22,
					content: "not a #comment here",
					comment: undefined,
					children: []
				}
			]
		},
		{
			depth: 1,
			line: 20,
			content: undefined,
			comment: "The next node is not a child of this comment",
			children: []
		} ,
		{
			depth: 1,
			line: 25,
			content: "Big3",
			comment: undefined,
			children: [
				{
					depth: 2,
					line: 26,
					content: "This is\na multi-line\nblock of\ntext",
					comment: undefined,
					children: []
				} ,
				{
					depth: 2,
					line: 31,
					content: "This is\n  another one\n\tand this # is not a comment\n> This is still the same block of text",
					comment: undefined,
					children: []
				} ,
				{
					depth: 2,
					line: 36,
					content: "A regular text-node",
					comment: undefined,
					children: []
				} ,
				{
					depth: 2,
					line: 38,
					content: "One line",
					comment: undefined,
					children: []
				} ,
			]
		} ,
		{
			depth: 1,
			line: 39,
			content: "This does not belong to the previous block",
			comment: undefined,
			children: []
		}
	]
} ;

expect( tree.diff( parsed , expected ) ).to.equal( null ) ;
expect( parsed ).to.eql( expected ) ;
```

